// Vercel serverless function with Supabase compatibility
// Using dynamic imports for better Vercel compatibility

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
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);
        
        const result = await sql`SELECT COUNT(*) as cruise_count FROM cruises`;
        const cruiseCount = parseInt(result[0].cruise_count);
        
        res.status(200).json({
          status: "ok",
          timestamp: new Date().toISOString(),
          database: {
            connected: true,
            cruise_count: cruiseCount,
            provider: "supabase"
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
      console.log("Fetching cruises from Supabase...");
      
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);
        
        // Query cruises from Supabase database
        const cruises = await sql`
          SELECT 
            id, name, ship, cruise_line, destination, 
            departure_port, duration, base_price, rating,
            image_url, departure_date, return_date, itinerary
          FROM cruises 
          ORDER BY rating DESC NULLS LAST
          LIMIT 6
        `;
        
        console.log("Found cruises:", cruises.length);
        
        // Transform to match frontend expectations
        const transformedCruises = cruises.map(cruise => ({
          id: cruise.id,
          name: cruise.name,
          ship: cruise.ship,
          cruiseLine: cruise.cruise_line,
          destination: cruise.destination,
          departurePort: cruise.departure_port,
          duration: cruise.duration,
          basePrice: cruise.base_price,
          rating: cruise.rating,
          imageUrl: cruise.image_url,
          departureDate: cruise.departure_date,
          returnDate: cruise.return_date,
          itinerary: cruise.itinerary
        }));
        
        res.status(200).json(transformedCruises);
        return;
      } catch (dbError) {
        console.error("Database query failed:", dbError);
        throw dbError;
      }
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