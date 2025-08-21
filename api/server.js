// Ultra-simple Vercel function without any imports
module.exports = async (req, res) => {
  console.log("=== VERCEL FUNCTION START ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Health check endpoint
    if (req.url === "/api/health") {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database_url_exists: !!process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV || 'production'
      });
      return;
    }

    // Cruises endpoint - return hardcoded data for now to test deployment
    if (req.url && req.url.startsWith("/api/cruises")) {
      console.log("Returning hardcoded cruise data");
      
      const sampleCruises = [
        {
          id: "cruise-1",
          name: "Caribbean Paradise",
          ship: "Royal Caribbean Oasis",
          cruiseLine: "Royal Caribbean",
          destination: "Caribbean",
          departurePort: "Miami, FL",
          duration: 7,
          basePrice: "899.00",
          rating: 4.5,
          imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
          departureDate: "2024-09-15T17:00:00.000Z",
          returnDate: "2024-09-22T08:00:00.000Z"
        },
        {
          id: "cruise-2", 
          name: "Mediterranean Odyssey",
          ship: "MSC Seaside",
          cruiseLine: "MSC Cruises",
          destination: "Mediterranean",
          departurePort: "Barcelona, Spain",
          duration: 10,
          basePrice: "1299.00",
          rating: 4.3,
          imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
          departureDate: "2024-10-01T18:00:00.000Z",
          returnDate: "2024-10-11T08:00:00.000Z"
        },
        {
          id: "cruise-3",
          name: "Norwegian Fjords Explorer", 
          ship: "Celebrity Eclipse",
          cruiseLine: "Celebrity Cruises",
          destination: "Northern Europe",
          departurePort: "Copenhagen, Denmark",
          duration: 10,
          basePrice: "1899.00",
          rating: 4.7,
          imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
          departureDate: "2024-08-12T17:00:00.000Z",
          returnDate: "2024-08-22T08:00:00.000Z"
        },
        {
          id: "cruise-4",
          name: "Alaska Wilderness Adventure",
          ship: "Norwegian Bliss",
          cruiseLine: "Norwegian Cruise Line", 
          destination: "Alaska",
          departurePort: "Seattle, WA",
          duration: 7,
          basePrice: "1599.00",
          rating: 4.6,
          imageUrl: "https://images.unsplash.com/photo-1586155025050-cc7cf580e2b0?w=400",
          departureDate: "2024-07-20T16:00:00.000Z",
          returnDate: "2024-07-27T09:00:00.000Z"
        }
      ];

      res.status(200).json(sampleCruises);
      return;
    }

    // Default 404
    res.status(404).json({ error: "Not Found" });
    
  } catch (error) {
    console.error("Function error:", error);
    res.status(500).json({
      error: "Function failed",
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
};