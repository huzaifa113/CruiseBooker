# 🚀 Supabase Migration Guide

## Step 1: Create Supabase Project (2 minutes)

1. **Sign up at [supabase.com](https://supabase.com)**
   - Use your GitHub account for faster setup
   - Select "Start your project" 

2. **Create New Project**
   - Name: `cruise-booking-platform` (or your preferred name)
   - Database Password: Generate strong password (save this!)
   - Region: Choose closest to your users (US East recommended for Vercel)
   - Pricing Plan: Free tier (500MB storage, unlimited API requests)

3. **Wait for Setup** (2-3 minutes)
   - Project will initialize automatically
   - You'll get a project dashboard

## Step 2: Get Connection Details (1 minute)

1. **Go to Settings > Database**
2. **Copy Connection String**
   - Look for "Connection string" section
   - Copy the PostgreSQL connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with the password you created

## Step 3: I'll Handle the Migration

Once you provide the Supabase connection string, I will:

1. **Update environment variables** - Set up the new DATABASE_URL
2. **Create database schema** - Set up the cruises table structure  
3. **Import your cruise data** - Transfer all 4 cruises with complete details
4. **Update Vercel configuration** - Optimize for Supabase connection
5. **Test the deployment** - Verify everything works perfectly

## What You Need to Provide

Just the **Supabase DATABASE_URL** connection string from Step 2 above.

## Expected Results

After migration:
- Same cruise data (Norwegian Fjords, Mediterranean, Alaska, Caribbean)
- Better Vercel deployment reliability
- Faster API response times
- Built-in database monitoring and backups

Ready to start? Create your Supabase project and share the DATABASE_URL when you have it!