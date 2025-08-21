// Vercel serverless function entry point
const { createServer } = require('http');
const app = require('../dist/index.js');

// Export the serverless function handler
module.exports = (req, res) => {
  // Handle the request using the Express app
  return app(req, res);
};