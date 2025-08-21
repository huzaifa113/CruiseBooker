// Import the Express app configured for Vercel
const express = require("express");
const path = require('path');

// Create Express app
const app = express();

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Add CORS headers for Vercel
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");  
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Initialize the app with routes
let initialized = false;

async function initializeApp() {
  if (initialized) return;
  
  try {
    console.log("Initializing Vercel serverless function...");
    
    // Dynamic import for ES modules - import server components
    const { registerRoutes } = await import("../server/routes.js");
    const { seedDatabase } = await import("../server/seed.js");
    
    // Seed database on startup (only if empty)
    try {
      await seedDatabase();
      console.log("Database seeded successfully");
    } catch (seedError) {
      console.error("Database seeding failed:", seedError);
      // Continue even if seeding fails
    }
    
    // Register routes
    await registerRoutes(app);
    console.log("Routes registered successfully");
    
    initialized = true;
  } catch (error) {
    console.error("Error initializing app:", error);
    throw error;
  }
}

// Export the async handler function for Vercel
module.exports = async (req, res) => {
  try {
    await initializeApp();
    
    // Handle the request
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};