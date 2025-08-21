# 🚀 Complete GitHub & Environment Setup Guide

## Quick GitHub Setup Options

### **Option 1: Direct from Replit (Recommended)**
1. In your Replit workspace, click the **"GitHub"** button in the left sidebar
2. Click **"Connect to GitHub"** if not already connected
3. Choose **"Create new repository"**
4. Repository name: `phoenix-vacation-group`
5. Make it Public/Private (your choice)
6. Click **"Create Repository"**
7. All your files will be automatically pushed!

### **Option 2: Manual Setup**
If you prefer manual control:
1. Create repository on GitHub.com named `phoenix-vacation-group`
2. Download your project as ZIP from Replit
3. Extract and push to GitHub using standard git commands

## 🔐 Environment Variables You Need

### **For Local Development (Replit)**
Your Replit already has these configured:
- ✅ `DATABASE_URL` - Already set up
- ⚠️ `SESSION_SECRET` - You may need this

### **For Vercel Deployment**
You'll need these environment variables in Vercel:

**Required:**
```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-super-secret-random-string-here
NODE_ENV=production
```

**Optional (for Stripe payments):**
```
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## 📝 How to Get These Values

### 1. **DATABASE_URL**
- **Neon** (Free): Go to [neon.tech](https://neon.tech), create project, copy connection string
- **Supabase** (Free): Go to [supabase.com](https://supabase.com), create project, get PostgreSQL URL
- **Railway**: Create PostgreSQL database, copy connection string

### 2. **SESSION_SECRET**
Generate a random string (32+ characters). You can use:
- Online generator: [randomkeygen.com](https://randomkeygen.com)
- Or in terminal: `openssl rand -base64 32`

### 3. **Stripe Keys** (Optional)
- Sign up at [stripe.com](https://stripe.com)
- Get your test keys from the Stripe dashboard
- For production, use live keys

## 🚀 Setting Environment Variables in Vercel

### After you deploy to Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - **Environment**: Production, Preview, Development (select all)
5. Repeat for all variables

## ✅ Verification Steps

### **Test Local Environment:**
1. Your app should already be running on `localhost:5000`
2. Check database connection works
3. All features should work locally

### **Test Production:**
1. After Vercel deployment, check all pages load
2. Test database operations (search cruises, bookings)
3. Monitor Vercel function logs for any errors

## 🔧 Troubleshooting

### **Common Issues:**
- **Database connection fails**: Check DATABASE_URL format
- **Session errors**: Ensure SESSION_SECRET is set
- **Build fails**: Check all dependencies are in package.json

### **Where to Get Help:**
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Neon docs: [neon.tech/docs](https://neon.tech/docs)
- This project's DEPLOYMENT.md file

## 🎯 Next Steps After GitHub Setup:
1. ✅ Push code to GitHub (using Option 1 or 2 above)
2. 🔐 Set up database (if you don't have one)
3. 🚀 Deploy to Vercel
4. ⚙️ Configure environment variables in Vercel
5. 🎉 Your app is live!