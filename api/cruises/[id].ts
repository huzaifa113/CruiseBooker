import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid cruise ID' });
    }

    const cruise = await storage.getCruise(id);
    if (!cruise) {
      return res.status(404).json({ message: "Cruise not found" });
    }
    res.status(200).json(cruise);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching cruise: " + error.message });
  }
}