# Admin Panel Setup Guide

## Issue: Row Level Security (RLS) Error

If you're getting errors like:
- `❌ Package creation failed: new row violates row-level security policy for table "packages"`
- `❌ Add-on creation failed: new row violates row-level security policy for table "addons"`

This means your Supabase database has Row Level Security enabled but doesn't have policies that allow admin operations.

## Quick Fix

### Option 1: Run the RLS Fix Script (Recommended)

1. **Go to your Supabase Dashboard**
   - Open your project at [supabase.com](https://supabase.com)
   - Navigate to the SQL Editor

2. **Run the RLS Fix Script**
   - Copy the contents of `admin-rls-fix.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Test the Admin Panel**
   - Go back to your admin panel
   - Try creating a package or add-on
   - It should work now!

### Option 2: Disable RLS Temporarily (Not Recommended for Production)

If you want to quickly disable RLS for testing:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: This removes all security restrictions. Only use for testing!

## What the Fix Does

The `admin-rls-fix.sql` script creates RLS policies that allow:

1. **Full admin access to packages table**
   - Read all packages (including inactive)
   - Create new packages
   - Update existing packages
   - Delete packages

2. **Full admin access to addons table**
   - Read all add-ons (including inactive)
   - Create new add-ons
   - Update existing add-ons
   - Delete add-ons

3. **Full admin access to bookings table**
   - Read all bookings
   - Update booking status
   - Delete bookings if needed

## Security Considerations

### For Production Use

The current fix allows unrestricted admin access. For production, you should:

1. **Implement proper authentication**
   - Add admin user authentication
   - Modify RLS policies to check for admin role
   - Example policy:
   ```sql
   CREATE POLICY "Allow authenticated admin access" ON packages
       FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
   ```

2. **Use service role key for admin operations**
   - Create admin-specific API endpoints
   - Use service role key (not anon key) for admin operations
   - Keep service role key secure on server-side only

### For Development/Testing

The current setup is fine for development and testing purposes.

## Troubleshooting

### Still Getting RLS Errors?

1. **Check if the script ran successfully**
   ```sql
   -- Run this to see current policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd 
   FROM pg_policies 
   WHERE tablename IN ('packages', 'addons', 'bookings');
   ```

2. **Verify permissions**
   ```sql
   -- Check table permissions
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name IN ('packages', 'addons', 'bookings');
   ```

3. **Test with simple insert**
   ```sql
   -- Try inserting test data
   INSERT INTO packages (id, name, price, service_type, is_active) 
   VALUES ('test_pkg', 'Test Package', 999, 'birthday', true);
   
   INSERT INTO addons (id, name, price, is_active)
   VALUES ('test_addon', 'Test Addon', 150, true);
   
   -- Clean up
   DELETE FROM packages WHERE id = 'test_pkg';
   DELETE FROM addons WHERE id = 'test_addon';
   ```

### Admin Panel Not Loading?

1. **Check browser console for errors**
2. **Verify Supabase configuration in `config.js`**
3. **Make sure you're logged into the admin panel**
4. **Check if all required files are present**

## Files Overview

- `admin-rls-fix.sql` - Fixes RLS policies for admin operations
- `admin-script.js` - Enhanced with better error handling
- `admin.html` - Admin panel interface
- `admin-styles.css` - Admin panel styling
- `admin-test.html` - Diagnostic test page
- `config.js` - Supabase configuration

## Testing

Use `admin-test.html` to test your database connection and admin operations:

1. Open `admin-test.html` in your browser
2. Run the connection test
3. Try creating test packages and add-ons
4. Check if everything works properly

## Support

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Make sure your database tables exist
4. Confirm your API keys are correct

The admin panel now includes fallback functionality, so even if the database operations fail, you can still test the interface locally.