import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid cruise ID' });
    }

    const cabinTypes = await storage.getCabinTypesByCruise(id);
    res.status(200).json(cabinTypes);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching cabin types: " + error.message });
  }
}