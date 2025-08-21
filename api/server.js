// Vercel serverless function - Simple approach
module.exports = async (req, res) => {
  try {
    console.log("=== VERCEL FUNCTION START ===");
    console.log("Request URL:", req.url);
    console.log("Request Method:", req.method);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // Simple health check
    if (req.url === "/api/health") {
      console.log("Health check requested");
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        database: {
          connected: !!process.env.DATABASE_URL
        }
      });
      return;
    }

    // Handle cruise API
    if (req.url?.startsWith("/api/cruises")) {
      console.log("Cruises API requested");
      
      // Import database modules
      const { neon } = await import("@neondatabase/serverless");
      const { drizzle } = await import("drizzle-orm/neon-http");
      
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL not configured");
      }

      const sql = neon(process.env.DATABASE_URL);
      const db = drizzle(sql);

      // Simple cruise query
      const cruises = await sql`
        SELECT * FROM cruises 
        ORDER BY rating DESC NULLS LAST
        LIMIT 6
      `;

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
      timestamp: new Date().toISOString()
    });
  }
};