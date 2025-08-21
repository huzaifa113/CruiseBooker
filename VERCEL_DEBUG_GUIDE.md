# 🔍 Vercel Deployment Debug Guide

## Current Issue
Your app is getting 500 server errors on Vercel but works locally. Here's how to debug and fix it.

## 🚨 Immediate Steps

### 1. **Push the Simplified Fix**
```bash
git add .
git commit -m "Simplify Vercel serverless function for debugging"
git push origin main
```

### 2. **Check Vercel Function Logs**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Functions** tab
4. Look for the latest function execution
5. Click on the failed function to see detailed logs

### 3. **Test Endpoints Step by Step**

After redeployment, test these URLs in order:

**A. Health Check:**
```
https://your-app.vercel.app/api/health
```
Expected: `{"status":"ok","timestamp":"...","database":{"connected":true}}`

**B. Cruises API:**
```
https://your-app.vercel.app/api/cruises
```
Expected: Array of cruise objects

**C. Full App:**
```
https://your-app.vercel.app/
```
Expected: Cruise cards should appear

## 🐛 Debug Information to Share

After testing the endpoints above, share this information:

### From Vercel Dashboard:
1. **Function Logs** - Copy the error logs from the Functions tab
2. **Build Logs** - Copy any build errors from the latest deployment
3. **Environment Variables** - Confirm these are set:
   - `DATABASE_URL` (should start with `postgresql://`)
   - `SESSION_SECRET`

### From Browser:
1. **Network Tab** - Show the exact error response from `/api/cruises`
2. **Console** - Copy any JavaScript errors

## 🔧 Common Issues & Solutions

### **Issue 1: Module Import Errors**
- **Symptom**: "Cannot resolve module" in function logs
- **Solution**: I've simplified the function to avoid complex imports

### **Issue 2: Database Connection**
- **Symptom**: "DATABASE_URL not configured" 
- **Solution**: Verify environment variable in Vercel settings

### **Issue 3: Cold Start Timeout**
- **Symptom**: Function times out on first request
- **Solution**: Simplified function should start faster

### **Issue 4: TypeScript Compilation**
- **Symptom**: "Cannot find module" TypeScript errors
- **Solution**: Using raw SQL instead of Drizzle in serverless function

## 📋 Verification Checklist

After redeployment, verify:
- [ ] Health endpoint returns 200 status
- [ ] Cruises endpoint returns data array
- [ ] Frontend displays cruise cards
- [ ] No 500 errors in browser console
- [ ] Vercel function logs show successful execution

## 📞 Next Steps

1. **Deploy the fix** using the git commands above
2. **Test the health endpoint** first
3. **Share the exact error logs** from Vercel dashboard if issues persist
4. **Provide network tab screenshot** showing the API response

The simplified serverless function should resolve the import issues and provide better error logging for debugging.