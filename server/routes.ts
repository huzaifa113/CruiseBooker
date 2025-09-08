import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, optionalAuth } from "./auth";
import { config } from 'dotenv';
config();

// Create isAuthenticated middleware for compatibility
const isAuthenticated = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    try {
      const { default: jwt } = await import('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  
  return res.status(401).json({ message: "Authentication required" });
};
// Authentication middleware for favorites - use same approach as working auth endpoints
const requireAuth = async (req: any, res: any, next: any) => {
  // Use optionalAuth to set req.user, then check if user exists
  const authResult = optionalAuth(req, res, () => {
    // If user was set by optionalAuth, continue
    if (req.user) {
      return next();
    }
    
    // No user found, return 401
    return res.status(401).json({ message: "Authentication required" });
  });
  
  // If optionalAuth returned early (error), don't continue
  return authResult;
};
import { sendWelcomeEmail, sendPaymentStatusEmail, sendBookingStatusEmail } from "./emailService";

// Helper function to generate iCal content
function generateICalendar(booking: any, cruise: any): string {
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Phoenix Vacation Group//Cruise Booking//EN
BEGIN:VEVENT
UID:cruise-${booking.id}@phoenixvacationgroup.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(cruise.departureDate)}
DTEND:${formatDate(cruise.returnDate)}
SUMMARY:${cruise.name} - ${cruise.ship}
DESCRIPTION:Cruise booking confirmation ${booking.confirmationNumber}\\n\\nShip: ${cruise.ship}\\nCruise Line: ${cruise.cruiseLine}\\nDuration: ${cruise.duration} days\\nGuests: ${booking.guestCount}\\nCabin: ${booking.cabinType?.name || 'Standard'}
LOCATION:${cruise.departurePort}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Cruise departure tomorrow from ${cruise.departurePort}
END:VALARM
END:VEVENT
END:VCALENDAR`;
  
  return icalContent;
}

import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup simple auth (optional - doesn't block users)
  setupSimpleAuth(app);

  // Basic routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy" });
  });

  // Email notification webhook routes
  app.post("/api/notify-signup", async (req, res) => {
    try {
      const { user_id, email } = req.body;
      
      if (!email || !user_id) {
        return res.status(400).json({ message: "Missing required fields: email, user_id" });
      }

      console.log(`Sending welcome email to ${email} for user ${user_id}`);
      const success = await sendWelcomeEmail(email, user_id);
      
      if (success) {
        res.json({ message: "Welcome email sent successfully", email, user_id });
      } else {
        res.status(500).json({ message: "Failed to send welcome email" });
      }
    } catch (error: any) {
      console.error("Error in notify-signup:", error);
      res.status(500).json({ message: "Error sending welcome email: " + error.message });
    }
  });

  app.post("/api/notify-payment", async (req, res) => {
    try {
      const { amount, created_at, status, user_email, confirmation_number } = req.body;
      
      if (!amount || !created_at || !status || !user_email) {
        return res.status(400).json({ message: "Missing required fields: amount, created_at, status, user_email" });
      }

      console.log(`Sending payment status email to ${user_email} for amount $${amount}, status: ${status}`);
      const success = await sendPaymentStatusEmail(user_email, amount, created_at, status, confirmation_number);
      
      if (success) {
        res.json({ message: "Payment status email sent successfully", user_email, amount, status });
      } else {
        res.status(500).json({ message: "Failed to send payment status email" });
      }
    } catch (error: any) {
      console.error("Error in notify-payment:", error);
      res.status(500).json({ message: "Error sending payment status email: " + error.message });
    }
  });

  app.post("/api/notify-booking", async (req, res) => {
    try {
      const { booking_details, status, user_email } = req.body;
      
      if (!booking_details || !status || !user_email) {
        return res.status(400).json({ message: "Missing required fields: booking_details, status, user_email" });
      }

      console.log(`Sending booking status email to ${user_email} for booking ${booking_details.confirmationNumber}, status: ${status}`);
      const success = await sendBookingStatusEmail(user_email, booking_details, status);
      
      if (success) {
        res.json({ message: "Booking status email sent successfully", user_email, status });
      } else {
        res.status(500).json({ message: "Failed to send booking status email" });
      }
    } catch (error: any) {
      console.error("Error in notify-booking:", error);
      res.status(500).json({ message: "Error sending booking status email: " + error.message });
    }
  });

  // Cruise routes
  app.get("/api/cruises", async (req, res) => {
    try {
      console.log("API: /api/cruises called");
      console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
      
      const filters: any = {};
      
      // Parse all search and filter parameters
      if (req.query.destination) filters.destination = req.query.destination as string;
      if (req.query.departurePort) filters.departurePort = req.query.departurePort as string;
      if (req.query.departureDate) filters.departureDate = req.query.departureDate as string;
      if (req.query.returnDate) filters.returnDate = req.query.returnDate as string;
      if (req.query.guestCount) filters.guestCount = parseInt(req.query.guestCount as string);
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
      if (req.query.duration) {
        // Handle multiple duration values
        const durations = Array.isArray(req.query.duration) 
          ? req.query.duration.map(d => parseInt(d as string))
          : [parseInt(req.query.duration as string)];
        filters.duration = durations;
      }
      if (req.query.cruiseLines) filters.cruiseLines = (req.query.cruiseLines as string).split(',');
      if (req.query.cabinTypes) filters.cabinTypes = (req.query.cabinTypes as string).split(',');
      if (req.query.deal) filters.deal = req.query.deal as string; // Add deal parameter
      if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
      if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as string;
      
      console.log("Filters applied:", filters);
      
      const cruises = await storage.getCruises(filters);
      console.log("Cruises found:", cruises.length);
      
      res.json(cruises);
    } catch (error: any) {
      console.error("Error in /api/cruises:", error);
      res.status(500).json({ message: "Error fetching cruises: " + error.message });
    }
  });

  app.get("/api/cruises/:id", async (req, res) => {
    try {
      const cruise = await storage.getCruise(req.params.id);
      if (!cruise) {
        return res.status(404).json({ message: "Cruise not found" });
      }
      res.json(cruise);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cruise: " + error.message });
    }
  });

  // Get cabin types for a cruise
  app.get("/api/cruises/:id/cabins", async (req, res) => {
    try {
      const cabinTypes = await storage.getCabinTypesByCruise(req.params.id);
      res.json(cabinTypes);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cabin types: " + error.message });
    }
  });

  // Get all extras
  app.get("/api/extras", async (req, res) => {
    try {
      const category = req.query.category as string;
      const extras = category 
        ? await storage.getExtrasByCategory(category)
        : await storage.getExtras();
      res.json(extras);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching extras: " + error.message });
    }
  });

  // Create a new booking
  app.post("/api/bookings", optionalAuth, async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      // Add user ID to booking data
      const bookingData = {
        ...validatedData,
        userId: (req as any).user?.id
      };
      // Create cabin hold before booking
      const canBook = await storage.checkCabinAvailability(
        validatedData.cruiseId, 
        validatedData.cabinTypeId, 
        validatedData.guestCount
      );
      
      if (!canBook) {
        return res.status(400).json({ message: "Selected cabin type is not available for the requested dates" });
      }
      
      // Create cabin hold (15-minute reservation)
      await storage.createCabinHold(
        validatedData.cruiseId,
        validatedData.cabinTypeId,
        validatedData.guestCount,
        (req as any).user?.id,
        (req as any).sessionID
      );
      
      const booking = await storage.createBooking(bookingData);
      
      // Create calendar events for the booking
      try {
        const cruise = await storage.getCruise(booking.cruiseId);
        if (cruise && cruise.itinerary) {
          const itinerary = cruise.itinerary as any[];
          
          // Create calendar event for cruise departure
          await storage.createCalendarEvent(booking.id, {
            eventType: 'departure',
            title: `${cruise.name} - Departure`,
            description: `Departure from ${cruise.departurePort}`,
            startDate: cruise.departureDate,
            location: cruise.departurePort
          });
          
          // Create calendar event for cruise return
          await storage.createCalendarEvent(booking.id, {
            eventType: 'arrival',
            title: `${cruise.name} - Return`,
            description: `Return to ${cruise.departurePort}`,
            startDate: cruise.returnDate,
            location: cruise.departurePort
          });
          
          // Create port call events
          for (const day of itinerary) {
            if (day.port && day.port !== 'At Sea') {
              await storage.createCalendarEvent(booking.id, {
                eventType: 'port_call',
                title: `Port Call - ${day.port}`,
                description: day.description || `Visit ${day.port}, ${day.country}`,
                startDate: new Date(day.date),
                location: `${day.port}, ${day.country}`
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to create calendar events:", error);
        // Don't fail booking creation if calendar creation fails
      }
      
      // Send booking creation notification email
      try {
        const bookingDetails = await storage.getBookingWithDetails(booking.id);
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_details: bookingDetails,
            status: 'created',
            user_email: bookingDetails?.primaryGuestEmail
          })
        });
        console.log(`Booking creation email sent for booking: ${booking.confirmationNumber}`);
      } catch (error) {
        console.error("Failed to send booking creation email:", error);
        // Don't fail booking creation if email notification fails
      }
      
      res.status(201).json(booking);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating booking: " + error.message });
    }
  });

  // Get booking by confirmation number
  app.get("/api/bookings/lookup", async (req, res) => {
    try {
      const confirmationNumber = req.query.confirmationNumber as string;
      const lastName = req.query.lastName as string;
      
      if (!confirmationNumber || !lastName) {
        return res.status(400).json({ message: "Confirmation number and last name are required" });
      }
      
      const booking = await storage.getBookingByConfirmation(confirmationNumber, lastName);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get related cruise and cabin information
      const cruise = await storage.getCruise(booking.cruiseId);
      const cabinType = await storage.getCabinType(booking.cabinTypeId);
      
      res.json({
        ...booking,
        cruise,
        cabinType
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error looking up booking: " + error.message });
    }
  });

  // Check promotion eligibility (useful for admin/preview)
  app.post("/api/promotions/check-eligibility", async (req, res) => {
    try {
      const { bookingAmount, promotionIds, bookingData } = req.body;
      
      if (!bookingAmount || !promotionIds || !bookingData) {
        return res.status(400).json({ message: "bookingAmount, promotionIds, and bookingData are required" });
      }
      
      const eligibilityResult = await storage.checkPromotionEligibility(bookingAmount, promotionIds, bookingData);
      res.json(eligibilityResult);
    } catch (error: any) {
      res.status(500).json({ message: "Error checking promotion eligibility: " + error.message });
    }
  });

  // Get user's bookings (for logged-in users)
  app.get("/api/user/bookings", optionalAuth, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Please log in to view your bookings" });
      }
      const userId = req.user.id;
      const userBookings = await storage.getUserBookings(userId);
      res.json(userBookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user bookings: " + error.message });
    }
  });

  // Get booking details for checkout (includes cruise and cabin info)
  app.get("/api/bookings/:id/details", async (req, res) => {
    try {
      const bookingWithDetails = await storage.getBookingWithDetails(req.params.id);
      if (!bookingWithDetails) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(bookingWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching booking details: " + error.message });
    }
  });

  // Stripe payment integration
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil'
  });
  
  // Create Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = "usd", bookingId } = req.body;
      
      if (!amount || !bookingId) {
        return res.status(400).json({ message: "Amount and booking ID are required" });
      }
      
      // Validate currency and amount
      const supportedCurrencies = ['usd', 'eur', 'sgd', 'thb'];
      const currencyCode = currency.toLowerCase();
      
      if (!supportedCurrencies.includes(currencyCode)) {
        return res.status(400).json({ message: "Unsupported currency" });
      }
      
      // Convert amount to smallest currency unit
      const baseAmount = parseFloat(amount);
      let amountInSmallestUnit;
      
      if (currencyCode === 'thb') {
        // THB doesn't use cents, but smallest unit is satang (1/100)
        amountInSmallestUnit = Math.round(baseAmount * 100);
      } else {
        // USD, EUR, SGD use cents
        amountInSmallestUnit = Math.round(baseAmount * 100);
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currencyCode,
        automatic_payment_methods: { enabled: true },
        metadata: {
          bookingId: bookingId,
          originalAmount: amount.toString(),
          originalCurrency: currency
        }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Get active promotions
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching promotions: " + error.message });
    }
  });

  // Apply promotions to a booking
  app.post("/api/promotions/apply", async (req, res) => {
    try {
      const { bookingAmount, promotionIds, bookingData } = req.body;
      const result = await storage.applyPromotion(bookingAmount, promotionIds, bookingData);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error applying promotion: " + error.message });
    }
  });
  
  // Download Invoice endpoint (JSON data for frontend PDF generation)
  app.get("/api/bookings/:id/invoice", async (req, res) => {
    try {
      const booking = await storage.getBookingWithDetails(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Generate invoice data for frontend PDF generation
      const invoiceData = {
        booking,
        cruise: booking.cruise,
        cabinType: booking.cabinType,
        generatedAt: new Date().toISOString(),
        invoiceNumber: `INV-${booking.confirmationNumber}-${Date.now()}`
      };
      
      res.json(invoiceData);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating invoice: " + error.message });
    }
  });

  // Download Invoice PDF endpoint (fallback to print method due to environment limitations)
  app.get("/api/bookings/:id/invoice-pdf", async (req, res) => {
    try {
      const booking = await storage.getBookingWithDetails(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Try to generate PDF invoice
      const invoiceData = {
        booking,
        cruise: booking.cruise,
        cabinType: booking.cabinType,
        generatedAt: new Date().toISOString(),
        invoiceNumber: `INV-${booking.confirmationNumber}-${Date.now()}`
      };
      
      const { generateInvoicePDF } = await import('./pdfService');
      const pdfBuffer = await generateInvoicePDF(invoiceData);
      
      if (pdfBuffer) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${booking.confirmationNumber}.pdf"`);
        res.send(pdfBuffer);
      } else {
        // Fallback to HTML version for print dialog
        return res.status(404).json({ message: "PDF generation not available, using print fallback" });
      }
      
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Error generating PDF invoice: " + error.message });
    }
  });

  // Email Confirmation endpoint
  app.post("/api/bookings/:id/email-confirmation", async (req, res) => {
    try {
      const booking = await storage.getBookingWithDetails(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // In a real app, you would integrate with an email service like SendGrid
      // For now, we'll simulate the email sending
      const emailData = {
        to: booking.primaryGuestEmail,
        subject: `Booking Confirmation - ${booking.cruise?.name}`,
        confirmationNumber: booking.confirmationNumber,
        bookingDetails: booking,
        sentAt: new Date().toISOString()
      };
      
      console.log("Email would be sent:", emailData);
      
      res.json({ 
        success: true, 
        message: "Confirmation email sent successfully",
        emailData 
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error sending email: " + error.message });
    }
  });

  // iCal export endpoint
  app.get("/api/bookings/:id/calendar", async (req, res) => {
    try {
      const booking = await storage.getBookingWithDetails(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const cruise = booking.cruise;
      if (!cruise) {
        return res.status(404).json({ message: "Cruise not found" });
      }
      
      // Generate iCal content
      const icalContent = generateICalendar(booking, cruise);
      
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', `attachment; filename="cruise-itinerary-${booking.confirmationNumber}.ics"`);
      res.send(icalContent);
    } catch (error: any) {
      res.status(500).json({ message: "Error generating calendar: " + error.message });
    }
  });
  
  // Calendar events
  app.get("/api/bookings/:id/events", async (req, res) => {
    try {
      const events = await storage.getCalendarEventsByBooking(req.params.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching calendar events: " + error.message });
    }
  });

  // Secure payment confirmation endpoint
  app.post("/api/bookings/:id/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId, amount, currency, paymentStatus } = req.body;
      const bookingId = req.params.id;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not successful" });
      }
      
      // Update booking with payment information
      const updatedBooking = await storage.updateBookingPayment(bookingId, {
        paymentIntentId,
        paymentStatus: 'completed',
        paidAmount: amount,
        paidCurrency: currency,
        paidAt: new Date()
      });

      // Create separate payment record in payments table
      await storage.createPaymentRecord({
        bookingId,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        status: 'paid',
        paymentMethod: 'card',
        stripePaymentIntentId: paymentIntentId,
        transactionId: paymentIntentId
      });

      // Release any cabin holds for this booking (payment confirmed, no longer need hold)
      try {
        const booking = await storage.getBooking(bookingId);
        if (booking) {
          // Clean up expired holds and release any holds for this booking
          await storage.releaseExpiredHolds();
        }
      } catch (error) {
        console.error("Error releasing cabin holds:", error);
        // Don't fail payment confirmation if hold release fails
      }
      
      // Get full booking details for email notifications
      const bookingWithDetails = await storage.getBookingWithDetails(bookingId);
      
      // Send payment confirmation email notification
      try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            created_at: new Date().toISOString(),
            status: 'paid',
            user_email: bookingWithDetails?.primaryGuestEmail,
            confirmation_number: bookingWithDetails?.confirmationNumber
          })
        });
        console.log(`Payment confirmation email sent for booking: ${bookingWithDetails?.confirmationNumber}`);
      } catch (error) {
        console.error("Failed to send payment confirmation email:", error);
      }
      
      // Send booking confirmation email notification
      try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_details: bookingWithDetails,
            status: 'confirmed',
            user_email: bookingWithDetails?.primaryGuestEmail
          })
        });
        console.log(`Booking confirmation email sent for booking: ${bookingWithDetails?.confirmationNumber}`);
      } catch (error) {
        console.error("Failed to send booking confirmation email:", error);
      }
      
      res.json({ 
        success: true, 
        booking: updatedBooking,
        message: "Payment confirmed successfully"
      });
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Resend booking confirmation email
  app.post("/api/bookings/:id/resend-email", async (req, res) => {
    try {
      const bookingId = req.params.id;
      
      // Get full booking details for email
      const bookingWithDetails = await storage.getBookingWithDetails(bookingId);
      
      if (!bookingWithDetails) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      if (!bookingWithDetails.primaryGuestEmail) {
        return res.status(400).json({ message: "No email address found for this booking" });
      }
      
      // Send booking confirmation email
      try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_details: bookingWithDetails,
            status: 'confirmed',
            user_email: bookingWithDetails.primaryGuestEmail
          })
        });
        
        console.log(`Booking confirmation email resent for booking: ${bookingWithDetails.confirmationNumber}`);
        
        res.json({ 
          success: true,
          message: "Confirmation email sent successfully",
          sentTo: bookingWithDetails.primaryGuestEmail
        });
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        res.status(500).json({ message: "Failed to send confirmation email" });
      }
      
    } catch (error: any) {
      console.error("Error in resend email:", error);
      res.status(500).json({ message: "Error resending email: " + error.message });
    }
  });

  // Favorites routes
  app.post("/api/favorites", optionalAuth, async (req, res) => {
    try {
      const { cruiseId } = req.body;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!cruiseId) {
        return res.status(400).json({ message: "Cruise ID is required" });
      }
      
      // Check if already favorited to prevent duplicates
      const alreadyFavorited = await storage.isFavorite(userId, cruiseId);
      if (alreadyFavorited) {
        return res.status(409).json({ message: "Cruise is already in favorites" });
      }
      
      const favorite = await storage.addFavorite(userId, cruiseId);
      res.json(favorite);
    } catch (error: any) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Error adding favorite: " + error.message });
    }
  });

  app.delete("/api/favorites/:cruiseId", optionalAuth, async (req, res) => {
    try {
      const { cruiseId } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      await storage.removeFavorite(userId, cruiseId);
      res.json({ message: "Favorite removed successfully" });
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Error removing favorite: " + error.message });
    }
  });

  app.get("/api/favorites", optionalAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Error fetching favorites: " + error.message });
    }
  });

  app.get("/api/favorites/:cruiseId/check", optionalAuth, async (req, res) => {
    try {
      const { cruiseId } = req.params;
      const userId = (req as any).user?.id;
      
      // Debug logging
      console.log("Favorites check debug:", { 
        hasUser: !!(req as any).user, 
        userId, 
        cruiseId,
        userObj: (req as any).user 
      });
      
      if (!userId) {
        // For unauthenticated users, return false instead of 401
        console.log("No user found, returning isFavorite: false");
        return res.json({ isFavorite: false });
      }
      
      const isFavorite = await storage.isFavorite(userId, cruiseId);
      res.json({ isFavorite });
    } catch (error: any) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Error checking favorite: " + error.message });
    }
  });

  // Admin Routes - Promotional Deal Management
  
  // Get all promotions (admin view)
  app.get("/api/admin/promotions", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error: any) {
      console.error("Error fetching admin promotions:", error);
      res.status(500).json({ message: "Error fetching promotions: " + error.message });
    }
  });

  // Create new promotion
  app.post("/api/admin/promotions", async (req, res) => {
    try {
      const { 
        name, 
        description, 
        discountType, 
        discountValue, 
        validFrom, 
        validTo, 
        maxUses,
        conditions,
        couponCode 
      } = req.body;

      // Validate required fields
      if (!name || !description || !discountType || !discountValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create promotion object
      const promotionData = {
        id: `promo-${Date.now()}`,
        name,
        description,
        discountType,
        discountValue: discountValue.toString(),
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        maxUses: maxUses || 1000,
        currentUses: 0,
        conditions: {
          ...conditions,
          ...(couponCode && { requiredCouponCode: couponCode })
        },
        isActive: true
      };

      // Insert into database
      await storage.createPromotion(promotionData);
      
      res.json({ success: true, promotion: promotionData });
    } catch (error: any) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Error creating promotion: " + error.message });
    }
  });

  // Update existing promotion
  app.put("/api/admin/promotions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await storage.updatePromotion(id, updateData);
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ message: "Error updating promotion: " + error.message });
    }
  });

  // Deactivate promotion
  app.delete("/api/admin/promotions/:id", async (req, res) => {
    try {
      const { id } = req.params;

      await storage.updatePromotion(id, { isActive: false });
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deactivating promotion:", error);
      res.status(500).json({ message: "Error deactivating promotion: " + error.message });
    }
  });

  // Get promotion usage statistics
  app.get("/api/admin/promotions/stats", async (req, res) => {
    try {
      const stats = await storage.getPromotionStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error fetching promotion stats:", error);
      res.status(500).json({ message: "Error fetching promotion stats: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

module.exports = { registerRoutes };