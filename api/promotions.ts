import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const activePromotions = await storage.getActivePromotions();
      res.status(200).json(activePromotions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching promotions: " + error.message });
    }
  } else if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}