import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Get related cruise and cabin details
    const cruise = await storage.getCruise(booking.cruiseId);
    const cabinType = booking.cabinTypeId ? await storage.getCabinType(booking.cabinTypeId) : null;

    const bookingWithDetails = {
      ...booking,
      cruise,
      cabinType,
    };

    res.status(200).json(bookingWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching booking details: " + error.message });
  }
}