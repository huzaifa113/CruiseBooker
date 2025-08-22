import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const category = req.query.category as string;
    const extras = category 
      ? await storage.getExtrasByCategory(category)
      : await storage.getExtras();
    res.status(200).json(extras);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching extras: " + error.message });
  }
}