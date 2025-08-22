import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { paymentIntentId } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const updatedBooking = await storage.updateBookingPaymentStatus(
      id, 
      'completed', 
      paymentIntentId
    );

    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: "Error confirming payment: " + error.message });
  }
}