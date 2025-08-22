// Environment variables with validation
export const env = {
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;

// Validate required environment variables
if (!env.STRIPE_PUBLISHABLE_KEY && env.PROD) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is required in production');
}