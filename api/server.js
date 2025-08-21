// Vercel serverless function with proper database connection
const { Pool } = require('pg');

// Create connection pool outside handler for reuse
let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  console.log("=== VERCEL FUNCTION START ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Health check endpoint
    if (req.url === "/api/health") {
      const dbPool = getPool();
      
      try {
        const result = await dbPool.query('SELECT COUNT(*) as cruise_count FROM cruises');
        const cruiseCount = parseInt(result.rows[0].cruise_count);
        
        res.status(200).json({
          status: "ok",
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            cruise_count: cruiseCount
          },
          environment: process.env.NODE_ENV || 'production'
        });
      } catch (dbError) {
        console.error("Database health check failed:", dbError);
        res.status(200).json({
          status: "ok",
          timestamp: new Date().toISOString(),
          database: {
            connected: false,
            error: dbError.message
          },
          environment: process.env.NODE_ENV || 'production'
        });
      }
      return;
    }

    // Handle cruise API
    if (req.url && req.url.startsWith("/api/cruises")) {
      console.log("Fetching cruises from database...");
      
      const dbPool = getPool();
      
      // Query cruises from database
      const query = `
        SELECT 
          id, name, ship, "cruiseLine", destination, 
          "departurePort", duration, "basePrice", rating,
          "imageUrl", "departureDate", "returnDate", itinerary
        FROM cruises 
        ORDER BY rating DESC NULLS LAST
        LIMIT 6
      `;
      
      const result = await dbPool.query(query);
      const cruises = result.rows;
      
      console.log("Found cruises:", cruises.length);
      
      res.status(200).json(cruises);
      return;
    }

    // Default 404
    res.status(404).json({ error: "Not Found" });
    
  } catch (error) {
    console.error("=== VERCEL FUNCTION ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      timestamp: new Date().toISOString(),
      url: req.url
    });
  }
};