import express, { type Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { enhancedSeedDatabase } from './enhanced-seed';
import { config } from 'dotenv';
config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      'https://cruise-booker.vercel.app' // Default Vercel domain
    ].filter(Boolean)
  : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed database on startup (only if empty)
  try {
    await enhancedSeedDatabase();
  } catch (error) {
    console.error('Database seeding failed:', error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  server
    .listen(
      {
        port,
        host: '0.0.0.0',
      },
      () => {
        log(`serving on port ${port}`);
      }
    )
    .on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Please stop the existing server first.`);
        process.exit(1);
      } else {
        log(`Server error: ${err.message}`);
        process.exit(1);
      }
    });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
})();
