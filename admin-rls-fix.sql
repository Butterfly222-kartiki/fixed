-- Admin Panel RLS Fix for Celebration Point
-- Run this SQL in your Supabase SQL Editor to fix the Row Level Security issues

-- ================================
-- ADMIN POLICIES FOR PACKAGES TABLE
-- ================================

-- Allow admin to read all packages (including inactive ones)
CREATE POLICY "Allow admin read access to all packages" ON packages
    FOR SELECT USING (true);

-- Allow admin to insert new packages
CREATE POLICY "Allow admin insert access to packages" ON packages
    FOR INSERT WITH CHECK (true);

-- Allow admin to update packages
CREATE POLICY "Allow admin update access to packages" ON packages
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow admin to delete packages
CREATE POLICY "Allow admin delete access to packages" ON packages
    FOR DELETE USING (true);

-- ================================
-- ADMIN POLICIES FOR ADDONS TABLE
-- ================================

-- Allow admin to read all addons (including inactive ones)
CREATE POLICY "Allow admin read access to all addons" ON addons
    FOR SELECT USING (true);

-- Allow admin to insert new addons
CREATE POLICY "Allow admin insert access to addons" ON addons
    FOR INSERT WITH CHECK (true);

-- Allow admin to update addons
CREATE POLICY "Allow admin update access to addons" ON addons
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow admin to delete addons
CREATE POLICY "Allow admin delete access to addons" ON addons
    FOR DELETE USING (true);

-- ================================
-- ADMIN POLICIES FOR BOOKINGS TABLE
-- ================================

-- Allow admin to read all bookings
CREATE POLICY "Allow admin read access to all bookings" ON bookings
    FOR SELECT USING (true);

-- Allow admin to update bookings (for status changes, etc.)
CREATE POLICY "Allow admin update access to bookings" ON bookings
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow admin to delete bookings if needed
CREATE POLICY "Allow admin delete access to bookings" ON bookings
    FOR DELETE USING (true);

-- ================================
-- GRANT PERMISSIONS TO ANON ROLE
-- ================================
-- This allows the admin panel to work without authentication
-- In production, you should implement proper admin authentication

-- Grant full access to packages for admin operations
GRANT ALL ON packages TO anon, authenticated;

-- Grant full access to addons for admin operations  
GRANT ALL ON addons TO anon, authenticated;

-- Grant full access to bookings for admin operations
GRANT ALL ON bookings TO anon, authenticated;

-- ================================
-- ALTERNATIVE: DISABLE RLS TEMPORARILY
-- ================================
-- If you want to completely disable RLS for admin operations,
-- uncomment the following lines (NOT recommended for production):

/*
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
*/

-- ================================
-- VERIFICATION QUERIES
-- ================================
-- Run these to verify the policies are working:

-- Check current policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('packages', 'addons', 'bookings');

-- Test insert permissions
-- INSERT INTO packages (id, name, price, service_type, is_active) 
-- VALUES ('test_pkg', 'Test Package', 999, 'birthday', true);

-- Test addon insert permissions  
-- INSERT INTO addons (id, name, price, is_active)
-- VALUES ('test_addon', 'Test Addon', 150, true);

-- Clean up test data
-- DELETE FROM packages WHERE id = 'test_pkg';
-- DELETE FROM addons WHERE id = 'test_addon';