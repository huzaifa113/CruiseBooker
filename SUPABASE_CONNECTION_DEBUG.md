# Supabase Connection Debug

## Current Issue
The hostname `db.zxvbyqzenmyqndbeyjno.supabase.co` is not resolving (ENOTFOUND error).

## Possible Causes
1. **Wrong hostname format** - Supabase connection URLs might use a different format
2. **Project not fully provisioned** - The Supabase project might still be setting up
3. **Incorrect connection string** - Need the pooler connection string specifically

## What to Check in Supabase

1. **Go to your project**: https://zxvbyqzenmyqndbeyjno.supabase.co/project/default/settings/database
2. **Look for "Connection string" section**
3. **Copy the "Transaction pooler" connection string** (not the direct connection)
4. **Make sure to replace [YOUR-PASSWORD] with your actual password**

The pooler URL format should be:
```
postgresql://postgres.zxvbyqzenmyqndbeyjno:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

Notice the difference:
- **Database direct**: `db.zxvbyqzenmyqndbeyjno.supabase.co:5432`
- **Pooler (for apps)**: `aws-0-us-west-1.pooler.supabase.com:6543`

## Next Steps
Please check your Supabase project settings and provide the correct **pooler connection string** for applications.