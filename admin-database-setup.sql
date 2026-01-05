-- Additional Database Setup for Admin Panel
-- Run these SQL commands in your Supabase SQL Editor after running the main setup

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    notes TEXT,
    total_bookings INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    last_booking DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disabled_availability table for managing availability
CREATE TABLE IF NOT EXISTS disabled_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    time_slot TEXT,
    type TEXT NOT NULL CHECK (type IN ('date', 'slot')),
    reason TEXT,
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(date, time_slot, type)
);

-- Create admin_settings table for storing configuration
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('business_opening_time', '10:00', 'string', 'Business opening time'),
('business_closing_time', '20:00', 'string', 'Business closing time'),
('advance_payment_percentage', '20', 'number', 'Advance payment percentage'),
('max_guests_per_booking', '50', 'number', 'Maximum guests per booking'),
('business_phone', '8805158674', 'string', 'Business phone number'),
('business_email', 'info@celebrationpoint.com', 'string', 'Business email'),
('business_address', 'Papaya Nursery, Near Mole Hall, Savarkar Nagar, Satpur, Nashik', 'string', 'Business address')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer statistics when booking is inserted or updated
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Insert or update customer record
        INSERT INTO customers (name, phone, email, total_bookings, total_spent, last_booking)
        VALUES (
            NEW.customer_name,
            NEW.customer_phone,
            NEW.customer_email,
            1,
            CASE WHEN NEW.booking_status = 'completed' THEN NEW.total_amount ELSE 0 END,
            NEW.event_date
        )
        ON CONFLICT (phone) DO UPDATE SET
            name = EXCLUDED.name,
            email = COALESCE(EXCLUDED.email, customers.email),
            total_bookings = customers.total_bookings + 1,
            total_spent = customers.total_spent + 
                CASE WHEN NEW.booking_status = 'completed' THEN NEW.total_amount ELSE 0 END,
            last_booking = GREATEST(customers.last_booking, EXCLUDED.last_booking),
            updated_at = NOW();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update customer stats
DROP TRIGGER IF EXISTS update_customer_stats_trigger ON bookings;
CREATE TRIGGER update_customer_stats_trigger
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

-- Create function to get booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats()
RETURNS TABLE (
    total_bookings BIGINT,
    pending_bookings BIGINT,
    confirmed_bookings BIGINT,
    completed_bookings BIGINT,
    cancelled_bookings BIGINT,
    total_revenue BIGINT,
    this_month_bookings BIGINT,
    this_month_revenue BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'completed'), 0) as total_revenue,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as this_month_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0) as this_month_revenue
    FROM bookings;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_last_booking ON customers(last_booking);
CREATE INDEX IF NOT EXISTS idx_disabled_availability_date ON disabled_availability(date);
CREATE INDEX IF NOT EXISTS idx_disabled_availability_type ON disabled_availability(type);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Enable Row Level Security for new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE disabled_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (you may want to modify these based on your auth setup)
CREATE POLICY "Allow admin access to customers" ON customers
    FOR ALL USING (true); -- In production, add proper admin authentication

CREATE POLICY "Allow admin access to disabled_availability" ON disabled_availability
    FOR ALL USING (true); -- In production, add proper admin authentication

CREATE POLICY "Allow admin access to admin_settings" ON admin_settings
    FOR ALL USING (true); -- In production, add proper admin authentication

-- Grant permissions
GRANT ALL ON customers TO anon, authenticated;
GRANT ALL ON disabled_availability TO anon, authenticated;
GRANT ALL ON admin_settings TO anon, authenticated;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE booking_status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE booking_status = 'confirmed') as confirmed_bookings,
    (SELECT COUNT(*) FROM bookings WHERE booking_status = 'completed') as completed_bookings,
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE booking_status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM packages WHERE is_active = true) as active_packages,
    (SELECT COUNT(*) FROM addons WHERE is_active = true) as active_addons;

-- Grant access to the view
GRANT SELECT ON admin_dashboard TO anon, authenticated;

-- Sample data for testing (optional)
-- Uncomment the following lines if you want some test data

/*
-- Insert sample disabled dates
INSERT INTO disabled_availability (date, type, reason) VALUES
('2024-12-25', 'date', 'Christmas Day - Closed'),
('2024-01-01', 'date', 'New Year Day - Closed');

-- Insert sample disabled time slots
INSERT INTO disabled_availability (date, time_slot, type, reason) VALUES
('2024-12-24', '18:00-19:00', 'slot', 'Private event'),
('2024-12-24', '19:00-20:00', 'slot', 'Private event');
*/