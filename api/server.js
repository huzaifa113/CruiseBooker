// Vercel serverless function handler
const path = require('path');

// Dynamic import for ES modules
let app;

const getApp = async () => {
  if (!app) {
    try {
      // Import the ES module
      const serverModule = await import('../dist/index.js');
      app = serverModule.default || serverModule;
    } catch (error) {
      console.error('Failed to load server:', error);
      throw error;
    }
  }
  return app;
};

// Export the async handler function for Vercel
module.exports = async (req, res) => {
  try {
    const serverApp = await getApp();
    return serverApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};