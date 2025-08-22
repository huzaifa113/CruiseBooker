import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/storage';
import { insertBookingSchema } from '../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
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
  } else if (req.method === 'GET') {
    // Handle booking lookup by confirmation number
    try {
      const { confirmationNumber, lastName } = req.query;
      
      if (!confirmationNumber || !lastName) {
        return res.status(400).json({ message: "Confirmation number and last name are required" });
      }

      const booking = await storage.getBookingByConfirmation(
        confirmationNumber as string, 
        lastName as string
      );
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(200).json(booking);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching booking: " + error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}