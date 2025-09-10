import express from 'express';
import cors from 'cors';

const app = express();

// CORS configuration for Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'https://cruise-booker.vercel.app',
  'http://localhost:3000', 
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { db } = await import('../dist/db.js');
    await db.execute('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Initialize database and register routes
let initialized = false;
async function initializeApp() {
  if (!initialized) {
    try {
      const { registerRoutes } = await import('../dist/routes.js');
      const { enhancedSeedDatabase } = await import('../dist/enhanced-seed.js');
      await enhancedSeedDatabase();
      await registerRoutes(app);
      initialized = true;
    } catch (error) {
      console.error('App initialization failed:', error);
      throw error;
    }
  }
  return app;
}

// Export for Vercel
export default async function handler(req, res) {
  const app = await initializeApp();
  return app(req, res);
}
