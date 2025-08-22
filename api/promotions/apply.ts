import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bookingAmount, promotionIds, bookingData } = req.body;

    if (!bookingAmount || !promotionIds || !Array.isArray(promotionIds)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await storage.applyPromotion(bookingAmount, promotionIds, bookingData);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error applying promotion: " + error.message });
  }
}