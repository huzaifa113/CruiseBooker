// Environment variables with validation
export const env = {
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL || '/api',
} as const;

// Validate required environment variables
if (!env.STRIPE_PUBLISHABLE_KEY && env.PROD) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY is not set - Stripe payments will not work');
}

// Log environment info in development
if (env.DEV) {
  console.log('Environment:', {
    NODE_ENV: env.NODE_ENV,
    API_URL: env.API_URL,
    STRIPE_KEY_SET: !!env.STRIPE_PUBLISHABLE_KEY,
  });
}
