# Get Your Supabase DATABASE_URL

## Steps to Get the Connection String

1. **Go to your Supabase dashboard**: https://zxvbyqzenmyqndbeyjno.supabase.co

2. **Navigate to Settings**:
   - Click the "Settings" icon (gear) in the left sidebar
   - Select "Database" from the settings menu

3. **Find Connection Info**:
   - Scroll down to "Connection string" section
   - Look for "URI" or "Connection string"
   - Copy the PostgreSQL connection string

4. **The format should look like**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.zxvbyqzenmyqndbeyjno.supabase.co:5432/postgres
   ```

5. **Replace the password**:
   - Replace `[YOUR-PASSWORD]` with the database password you set when creating the project

## What I Need

Please provide the complete connection string that starts with `postgresql://postgres:` and includes your actual password.

Once you share this, I'll immediately:
- Set up the database schema
- Import all your cruise data  
- Update the Vercel configuration
- Fix the deployment issues