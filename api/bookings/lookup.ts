import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
    const cabinType = booking.cabinTypeId ? await storage.getCabinType(booking.cabinTypeId) : null;
    
    res.status(200).json({
      ...booking,
      cruise,
      cabinType
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error looking up booking: " + error.message });
  }
}