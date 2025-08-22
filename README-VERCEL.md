# Vercel Deployment Guide

This project has been converted to be Vercel-compatible. Here's what you need to know:

## Project Structure

- `/api/` - Vercel serverless functions (converted from Express routes)
- `/client/` - React frontend application
- `/shared/` - Shared TypeScript schemas and utilities
- `vercel.json` - Vercel deployment configuration

## API Functions

The following serverless functions have been created:

- `GET /api/health` - Health check endpoint
- `GET /api/cruises` - Get all cruises with filtering
- `GET /api/cruises/[id]` - Get specific cruise
- `GET /api/cruises/[id]/cabins` - Get cabin types for a cruise
- `GET /api/extras` - Get all extras/add-ons
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/lookup` - Lookup booking by confirmation
- `GET /api/bookings/[id]/details` - Get booking details
- `POST /api/bookings/[id]/confirm-payment` - Confirm payment
- `GET /api/bookings/[id]/calendar` - Download iCal file
- `GET /api/promotions` - Get active promotions
- `POST /api/promotions/apply` - Apply promotions
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `GET /api/auth/user` - Get current user (returns null)

## Database

- Uses PostgreSQL with Drizzle ORM
- Connection pooling optimized for serverless
- Set `DATABASE_URL` environment variable

## Environment Variables

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)

## Deployment Steps

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy - Vercel will automatically:
   - Build the frontend using Vite
   - Deploy serverless functions from `/api` directory
   - Serve static files from build output

## Key Changes Made

1. **Converted Express routes to serverless functions** - Each route is now a separate file in `/api`
2. **Optimized database connections** - Added connection pooling for serverless environment
3. **Updated build configuration** - Simplified for Vercel's build system
4. **Added TypeScript support** - All API functions use TypeScript with proper types

## Testing

The application should work identically to the Express version but will run on Vercel's serverless infrastructure.