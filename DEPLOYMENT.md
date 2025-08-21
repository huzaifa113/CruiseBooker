# Deploying Phoenix Vacation Group to Vercel

## Prerequisites

1. **GitHub Account**: Your code needs to be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) and connect your GitHub account
3. **Database**: You'll need a PostgreSQL database (Neon is recommended for free tier)

## Environment Variables Required

Before deploying, you'll need these environment variables in Vercel:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-secure-random-string-here
NODE_ENV=production
```

Optional (for Stripe payments):
```
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/phoenix-vacation-group.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### 3. Add Environment Variables

In the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each environment variable listed above

### 4. Deploy Database Schema

After your first deployment:
```bash
npm run db:push
```

Or manually create the database schema using your database provider's interface.

## Project Structure for Vercel

The project is configured with:
- `vercel.json` - Deployment configuration
- `server/vercel.ts` - Serverless function entry point  
- `client/dist/` - Built frontend assets (generated during build)
- API routes handled by serverless functions

## Troubleshooting

### Common Issues

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Database Connection**: Verify your `DATABASE_URL` is correct
3. **API Routes Not Working**: Ensure `server/vercel.ts` is properly configured

### Logs and Monitoring

- Check Vercel Function logs in your dashboard
- Monitor performance and errors in the Vercel Analytics tab
- Use `console.log` statements for debugging (visible in Function logs)

## Post-Deployment

1. **Custom Domain**: Add your custom domain in Vercel project settings
2. **SSL**: Automatic with Vercel
3. **Performance**: Monitor Core Web Vitals in Vercel Analytics
4. **Database**: Set up regular backups for your production database

## Development vs Production

- **Development**: Runs on `localhost:5000` with hot reloading
- **Production**: Serverless functions on Vercel with static file serving
- **Database**: Use separate databases for development and production

## Using with VS Code

The app works perfectly with VS Code. The DOM nesting warning has been fixed. You can:
- Use the Replit extension for seamless development
- Set up debugging with VS Code's Node.js debugger
- Use Git integration for version control

No conflicts between VS Code and Replit - they complement each other well!