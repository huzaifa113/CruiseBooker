import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from './_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("API: /api/cruises called");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    const filters: any = {};
    
    // Simplified parsing - destination-based search only
    if (req.query.destination) filters.destination = req.query.destination as string;
    if (req.query.sortBy) filters.sortBy = req.query.sortBy as string;
    if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder as string;
    
    console.log("Filters applied:", filters);
    
    const cruises = await storage.getCruises(filters);
    console.log("Cruises found:", cruises.length);
    
    res.status(200).json(cruises);
  } catch (error: any) {
    console.error("Error in /api/cruises:", error);
    res.status(500).json({ message: "Error fetching cruises: " + error.message });
  }
}