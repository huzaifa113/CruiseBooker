import type { Express } from "express";
import { createServer, type Server } from "http";
// import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

// iCal generation utility
function generateICalendar(booking: any, cruise: any): string {
  const now = new Date();
  const startDate = new Date(cruise.departureDate);
  const endDate = new Date(cruise.returnDate);
  
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Phoenix Vacation Group//Cruise Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  
  // Add main cruise event
  icalContent.push(
    'BEGIN:VEVENT',
    `UID:cruise-${booking.id}-main@phoenixvacationgroup.com`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${cruise.name} - ${cruise.cruiseLine}`,
    `DESCRIPTION:Cruise booking confirmation ${booking.confirmationNumber}\\nShip: ${cruise.ship}\\nDuration: ${cruise.duration} days`,
    `LOCATION:${cruise.departurePort}`,
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );
  
  // Add port calls if itinerary exists
  if (cruise.itinerary) {
    cruise.itinerary.forEach((day: any) => {
      if (day.port !== 'At Sea' && day.arrival) {
        const arrivalTime = day.arrival ? `${day.arrival}:00` : '09:00:00';
        const departureTime = day.departure ? `${day.departure}:00` : '17:00:00';
        
        const eventStart = new Date(`${day.date}T${arrivalTime}`);
        const eventEnd = new Date(`${day.date}T${departureTime}`);
        
        icalContent.push(
          'BEGIN:VEVENT',
          `UID:cruise-${booking.id}-port-${day.day}@phoenixvacationgroup.com`,
          `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART:${eventStart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${eventEnd.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `SUMMARY:Port Call: ${day.port}`,
          `DESCRIPTION:${day.description}\\nArrival: ${day.arrival || 'TBD'}\\nDeparture: ${day.departure || 'TBD'}`,
          `LOCATION:${day.port}${day.country ? ', ' + day.country : ''}`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      }
    });
  }
  
  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
}

// Temporarily disabled Stripe integration - skipping payment features for now
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      console.log("Health check called");
      const dbConnected = !!process.env.DATABASE_URL;
      
      // Simple database test
      const cruiseCount = await storage.getCruises();
      
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: {
          connected: dbConnected,
          cruiseCount: cruiseCount.length
        },
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error: any) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get all cruises with optional filtering
  app.get("/api/cruises", async (req, res) => {
    try {
      console.log("API: /api/cruises called");
      console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
      
      const filters = {
        destination: req.query.destination as string,
        departurePort: req.query.departurePort as string,
        departureDate: req.query.departureDate ? new Date(req.query.departureDate as string) : undefined,
        returnDate: req.query.returnDate ? new Date(req.query.returnDate as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        duration: req.query.duration ? (req.query.duration as string).split(',').map(d => parseInt(d)) : undefined,
        cruiseLines: req.query.cruiseLines ? (req.query.cruiseLines as string).split(',') : undefined,
        cabinTypes: req.query.cabinTypes ? (req.query.cabinTypes as string).split(',') : undefined,
        guestCount: req.query.guestCount ? parseInt(req.query.guestCount as string) : undefined,
        sortBy: req.query.sortBy as 'price' | 'departure' | 'duration' | 'rating',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]);
      
      console.log("Filters applied:", filters);
      const cruises = await storage.getCruises(filters);
      console.log("Cruises found:", cruises.length);
      
      res.json(cruises);
    } catch (error: any) {
      console.error("Error in /api/cruises:", error);
      res.status(500).json({ 
        message: "Error fetching cruises: " + error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get single cruise by ID
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
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
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
      
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error looking up booking: " + error.message });
    }
  });

  // Get user's bookings (for logged-in users)
  app.get("/api/user/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userBookings = await storage.getUserBookings(userId);
      res.json(userBookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user bookings: " + error.message });
    }
  });

  // Get booking details for checkout (includes cruise and cabin info)
  app.get("/api/bookings/:id/details", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
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
      res.status(500).json({ message: "Error fetching booking details: " + error.message });
    }
  });

  // Get booking details with cruise and cabin info
  app.get("/api/bookings/:id/details", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const cruise = await storage.getCruise(booking.cruiseId);
      const cabinType = await storage.getCabinType(booking.cabinTypeId);
      
      res.json({
        booking,
        cruise,
        cabinType
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching booking details: " + error.message });
    }
  });

  // Stripe payment integration
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia'
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
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          bookingId,
          originalAmount: baseAmount.toString(),
          originalCurrency: currencyCode
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        totalAmount: baseAmount,
        currency: currencyCode
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Update booking payment status
  app.patch("/api/bookings/:id/payment", async (req, res) => {
    try {
      const { status, stripePaymentIntentId } = req.body;
      const booking = await storage.updateBookingPaymentStatus(req.params.id, status, stripePaymentIntentId);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating payment status: " + error.message });
    }
  });

  // Inventory hold management endpoints
  app.post("/api/cabins/hold", async (req, res) => {
    try {
      const { cruiseId, cabinTypeId, quantity, userId, sessionId } = req.body;
      
      // Check availability first
      const available = await storage.checkCabinAvailability(cruiseId, cabinTypeId, quantity);
      if (!available) {
        return res.status(400).json({ message: "Requested cabins not available" });
      }
      
      const hold = await storage.createCabinHold(cruiseId, cabinTypeId, quantity, userId, sessionId);
      res.json(hold);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating cabin hold: " + error.message });
    }
  });
  
  app.delete("/api/cabins/hold/:holdId", async (req, res) => {
    try {
      await storage.releaseCabinHold(req.params.holdId);
      res.json({ message: "Hold released successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error releasing hold: " + error.message });
    }
  });
  
  app.get("/api/cabins/availability/:cruiseId/:cabinTypeId", async (req, res) => {
    try {
      const { cruiseId, cabinTypeId } = req.params;
      const quantity = parseInt(req.query.quantity as string) || 1;
      const available = await storage.checkCabinAvailability(cruiseId, cabinTypeId, quantity);
      res.json({ available });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking availability: " + error.message });
    }
  });
  
  // Promotion endpoints
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching promotions: " + error.message });
    }
  });

  app.post("/api/promotions/apply", async (req, res) => {
    try {
      const { bookingAmount, promotionIds, bookingData } = req.body;
      
      if (!bookingAmount || !promotionIds || !Array.isArray(promotionIds)) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const result = await storage.applyPromotion(bookingAmount, promotionIds, bookingData);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error applying promotion: " + error.message });
    }
  });
  
  app.post("/api/promotions/apply", async (req, res) => {
    try {
      const { bookingAmount, promotionIds, bookingData } = req.body;
      const result = await storage.applyPromotion(bookingAmount, promotionIds, bookingData);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Error applying promotion: " + error.message });
    }
  });
  
  // iCal export endpoint
  app.get("/api/bookings/:id/calendar", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const cruise = await storage.getCruise(booking.cruiseId);
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

  const httpServer = createServer(app);
  return httpServer;
}
