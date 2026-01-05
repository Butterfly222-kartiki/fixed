-- Migration Script: Add Customizable Extra Hours Add-on Support
-- Run this in your Supabase SQL Editor if you already have an existing database

-- Add new columns to addons table
ALTER TABLE addons 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'time_extension')),
ADD COLUMN IF NOT EXISTS extension_hours INTEGER DEFAULT 0;

-- Update existing addons to have the regular type
UPDATE addons SET type = 'regular', extension_hours = 0 WHERE type IS NULL;

-- Insert the new Customizable Extra Hours add-on
INSERT INTO addons (id, name, description, price, type, extension_hours, is_active) 
VALUES (
    'addon_extra_hours', 
    'Extra Hours Extension', 
    'Extend your celebration by additional hours (1-4 hours). Perfect for longer celebrations and more memories! Price is per hour.', 
    300, 
    'time_extension', 
    1, 
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    type = EXCLUDED.type,
    extension_hours = EXCLUDED.extension_hours,
    is_active = EXCLUDED.is_active;

-- Add a new table to track selected hours for bookings (optional, for detailed tracking)
CREATE TABLE IF NOT EXISTS booking_addon_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id TEXT REFERENCES addons(id),
    quantity INTEGER DEFAULT 1,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for the new table
ALTER TABLE booking_addon_details ENABLE ROW LEVEL SECURITY;

-- Create policy for the new table
CREATE POLICY "Allow public access to booking_addon_details" ON booking_addon_details
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON booking_addon_details TO anon, authenticated;

-- Verify the changes
SELECT id, name, price, type, extension_hours FROM addons ORDER BY type, price;