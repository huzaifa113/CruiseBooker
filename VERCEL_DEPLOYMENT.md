# 🚀 Vercel Deployment Guide

This guide will help you deploy the CruiseBooker application to Vercel with full-stack functionality.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code must be pushed to GitHub
3. **Database**: A PostgreSQL database (recommend Neon or Supabase)
4. **Stripe Account**: For payment processing
5. **SendGrid Account**: For email services (optional)

## 🏗️ Project Structure for Vercel

The project is configured with:
- **Frontend**: React app built with Vite → deployed as static files
- **Backend**: Express API → converted to Vercel serverless functions
- **Database**: PostgreSQL with Drizzle ORM
- **Build Output**: Client builds to `client/dist`, API runs from `api/index.js`

## ⚙️ Environment Variables

Set these in your Vercel dashboard under **Project Settings → Environment Variables**:

### 🗄️ Database
```
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

### 🔐 Authentication
```
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
SESSION_SECRET=your-session-secret-key-at-least-32-characters
```

### 💳 Stripe Payment
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### 📧 Email (SendGrid)
```
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### 🌐 Application Configuration
```
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app
VERCEL_URL=your-project.vercel.app
```

## 🚀 Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Framework Preset**: Vite
5. **Root Directory**: Leave empty (monorepo setup)

### 3. Configure Build Settings
In the import dialog:
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

### 4. Set Environment Variables
1. Go to **Project Settings → Environment Variables**
2. Add all variables from the list above
3. Make sure to set them for **Production**, **Preview**, and **Development**

### 5. Deploy
1. Click **Deploy**
2. Wait for the build to complete
3. Your app will be live at `https://your-project.vercel.app`

## 🔧 Post-Deployment Configuration

### Database Setup
1. **Create Tables**: The app will automatically run database seeding on first deployment
2. **Check Connection**: Monitor the Function Logs in Vercel to ensure database connection is successful

### Domain Configuration (Optional)
1. **Custom Domain**: Go to **Project Settings → Domains**
2. Add your custom domain
3. Update `FRONTEND_URL` environment variable with your custom domain

### SSL Certificate
Vercel automatically provides SSL certificates for all deployments.

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
- **Check build logs** in Vercel dashboard
- **Verify all dependencies** are in `package.json`
- **Environment variables** must be set before build

#### 2. API Route Issues
```
Error: Cannot resolve module
```
**Solution**: Ensure all server dependencies are properly bundled

#### 3. Database Connection Issues
```
Error: Connection terminated
```
**Solution**: 
- Verify `DATABASE_URL` is correctly set
- Check database server is accessible from Vercel
- Ensure database allows external connections

#### 4. CORS Issues
```
Access to fetch at 'api/...' from origin 'https://...' has been blocked by CORS policy
```
**Solution**: The app is configured to handle CORS automatically using the `VERCEL_URL` environment variable

### Debugging Steps
1. **Check Function Logs**: Vercel Dashboard → Functions → View Function Logs
2. **Test API Endpoints**: Use the Vercel Function URL directly
3. **Environment Variables**: Verify all required variables are set
4. **Build Output**: Check the build output in deployment logs

## 📊 Monitoring

### Performance
- **Web Vitals**: Automatically monitored in Vercel Analytics
- **Function Performance**: Monitor execution time and memory usage

### Error Tracking
- **Server Logs**: Available in Vercel Function Logs
- **Client Errors**: Use browser dev tools or add error tracking

## 🔄 Continuous Deployment

Once set up, every push to your main branch will:
1. **Trigger automatic deployment**
2. **Run build process**
3. **Deploy to production**
4. **Preview deployments** for pull requests

## 📈 Scaling Considerations

### Vercel Limits
- **Function Timeout**: 30 seconds (configured in `vercel.json`)
- **Function Memory**: 512MB default
- **Concurrent Executions**: Based on plan
- **Bandwidth**: Based on plan

### Database Performance
- **Connection Pooling**: Recommended for production
- **Read Replicas**: For high-traffic applications
- **Caching**: Consider Redis for session storage

## 🔒 Security Checklist

- ✅ **Environment Variables**: Never commit sensitive data
- ✅ **HTTPS**: Enforced by default on Vercel
- ✅ **JWT Secrets**: Use strong, random secrets
- ✅ **Database**: Secure connection strings
- ✅ **CORS**: Properly configured origins
- ✅ **Input Validation**: Server-side validation implemented

## 📞 Support

If you encounter issues:
1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Review Build Logs**: In your Vercel dashboard
3. **Test Locally**: Ensure your app works locally first
4. **Community Support**: Vercel Discord community

## 🎉 Success!

Your CruiseBooker application should now be running on Vercel with:
- ✅ **Static frontend** serving React app
- ✅ **Serverless API** handling all backend logic
- ✅ **Database connectivity** for data persistence
- ✅ **Payment processing** via Stripe
- ✅ **Email notifications** via SendGrid
- ✅ **Multi-language support** (EN/TH)
- ✅ **Responsive design** for all devices

Your live URL: `https://your-project.vercel.app`

---

🚢 **Happy Sailing with CruiseBooker!** ⚓
