import type { Express } from "express";
import { createServer, type Server } from "http";
// import Stripe from "stripe";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

// Temporarily disabled Stripe integration - skipping payment features for now
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2023-10-16",
// });

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Temporarily disabled Stripe payment endpoints
  // Create Stripe payment intent
  // app.post("/api/create-payment-intent", async (req, res) => {
  //   try {
  //     const { amount, currency = "usd", bookingId } = req.body;
      
  //     if (!amount || !bookingId) {
  //       return res.status(400).json({ message: "Amount and booking ID are required" });
  //     }
      
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(amount * 100), // Convert to cents
  //       currency: currency.toLowerCase(),
  //       metadata: {
  //         bookingId
  //       }
  //     });
      
  //     res.json({ clientSecret: paymentIntent.client_secret });
  //   } catch (error: any) {
  //     res.status(500).json({ message: "Error creating payment intent: " + error.message });
  //   }
  // });

  // Update booking payment status
  // app.patch("/api/bookings/:id/payment", async (req, res) => {
  //   try {
  //     const { status, stripePaymentIntentId } = req.body;
  //     const booking = await storage.updateBookingPaymentStatus(req.params.id, status, stripePaymentIntentId);
  //     res.json(booking);
  //   } catch (error: any) {
  //     res.status(500).json({ message: "Error updating payment status: " + error.message });
  //   }
  // });

  const httpServer = createServer(app);
  return httpServer;
}
