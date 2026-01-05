-- Supabase Database Setup for Celebration Point Booking System
-- Run these SQL commands in your Supabase SQL Editor

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration TEXT,
    service_type TEXT NOT NULL,
    features TEXT[] DEFAULT '{}',
    description TEXT,
    badge TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    
    -- Customer details
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    
    -- Event details
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    guest_count INTEGER DEFAULT 2,
    special_requests TEXT,
    
    -- Booking details
    service_type TEXT NOT NULL,
    selected_package_id TEXT NOT NULL,
    selected_package_name TEXT NOT NULL,
    package_price INTEGER NOT NULL,
    selected_addons TEXT[] DEFAULT '{}',
    addons_price INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    advance_amount INTEGER NOT NULL,
    
    -- Status
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key reference
    FOREIGN KEY (selected_package_id) REFERENCES packages(id)
);

-- Insert sample packages data
INSERT INTO packages (id, name, price, duration, service_type, features, badge) VALUES
-- Birthday Packages
('birthday_599', '₹599 Package', 599, '1 Hour Slot', 'birthday', 
 ARRAY['Balloon & Tent Decoration', 'Separate Decorated Hall', 'Sound System', 'Entry Eye Mask', 'Party Crown 👑', 'Candles'], 
 'Basic'),

('birthday_799', '₹799 Package', 799, '1 Hour Slot', 'birthday', 
 ARRAY['Cake Included 🎂', 'Balloon & Tent Decoration', 'Separate Decorated Hall', 'Sound System', 'Entry Eye Mask', 'Party Crown 👑', 'Candles'], 
 'Popular'),

('birthday_1399', '₹1399 Package', 1399, '1 Hour Slot', 'birthday', 
 ARRAY['Cake 🎂', 'Balloon & Tent Decoration', 'Separate Decorated Hall', 'Sound System', 'LED Name Display', 'Smoke Effect 💨', '2 Cold Coffees ☕', 'Party Crown 👑'], 
 'Premium'),

('birthday_1899', '₹1899 Premium Package', 1899, '1 Hour + 2 Hours Bonus', 'birthday', 
 ARRAY['Cake 🎂', 'Balloon & Tent Decoration', 'Sound System', 'LED Name Display', 'Smoke Effect 💨', '2 Hot Coffees ☕', 'Peri Peri Fries 🍟', '3-Hour Mini Theater Experience 🎥🍿'], 
 'Luxury'),

-- Romantic Date Packages
('romantic_399', 'Basic Romantic Date', 399, '60 minutes', 'romantic', 
 ARRAY['Balloon decoration 🎈 with cozy ambient lighting', 'Table for 2 with rose petals 🌹', 'Soft romantic music playlist 🎶', '60-minute couple seating + photo spot 📸', 'Peaceful private time for connection 💞', '2 Hot Coffees ☕☕'], 
 'Perfect for first-time daters'),

('romantic_499', 'Classic Date Setup', 499, '60 minutes', 'romantic', 
 ARRAY['Everything from Basic setup ✅', 'Welcome message board with couple names 🪧', 'Chocolate treat 🍫 + candlelight table setup 🕯️', '2 Cold Coffees 🧋🧋'], 
 'Ideal for celebrations'),

('romantic_699', 'Candlelight Premium Date', 699, '60 minutes', 'romantic', 
 ARRAY['Everything from Classic setup ✅', 'Heart-shaped candle decoration ❤️‍🔥', '₹200 Food Coverage 🍕', 'Self photos & videos played on screen 📽️', '3–5 photo clicks by our staff 📸'], 
 'Perfect for romance'),

('romantic_999', 'Signature Date with Surprise Gift', 999, '60 minutes', 'romantic', 
 ARRAY['All Premium inclusions ✅', 'Customized printed gift 🎁 (Mug / Photo Frame)', '5-minute personal video screening on projector 🎞️', '5+ professional couple photos 📸'], 
 'Unforgettable memories'),

-- Anniversary Packages (you can add more)
('anniversary_1299', 'Golden Anniversary', 1299, '90 minutes', 'anniversary', 
 ARRAY['Elegant candle decoration', 'Anniversary cake', 'Champagne toast', 'Photo session', 'Romantic music'], 
 'Elegant'),

-- Mini Theatre Packages (you can add more)
('theatre_899', 'Mini Theatre Experience', 899, '2 hours', 'theatre', 
 ARRAY['Private theatre room', 'Movie of your choice', 'Popcorn & snacks', 'Comfortable seating', 'Sound system'], 
 'Cinematic');

-- Insert sample addons data
INSERT INTO addons (id, name, description, price) VALUES
('addon_photos', 'Personal Photos & Videos on Screen', 'तुमचे वैयक्तिक फोटो आणि व्हिडिओ स्क्रीनवर मेमरीज स्लाइडशोच्या स्वरूपात दाखवले जातील', 150),
('addon_photoshoot', 'Full Photoshoot + 1 Free Instagram Reel', 'पूर्ण फोटोशूट केले जाईल आणि त्यासोबत 1 मोफत इंस्टाग्राम रील तयार केली जाईल', 400),
('addon_bouquet', 'Flower Bouquet (for photoshoot)', 'फोटोशूटसाठी एक सुंदर फुलांचा बुके दिला जाईल', 100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_service_type ON packages(service_type);
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_addons_active ON addons(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to packages and addons
CREATE POLICY "Allow public read access to active packages" ON packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active addons" ON addons
    FOR SELECT USING (is_active = true);

-- Create policy for public insert access to bookings
CREATE POLICY "Allow public insert access to bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Create policy for authenticated users to read their own bookings
CREATE POLICY "Allow users to read their own bookings" ON bookings
    FOR SELECT USING (true); -- You can modify this based on your auth requirements

-- Grant necessary permissions
GRANT SELECT ON packages TO anon, authenticated;
GRANT SELECT ON addons TO anon, authenticated;
GRANT INSERT ON bookings TO anon, authenticated;
GRANT SELECT ON bookings TO anon, authenticated;

-- Optional: Create a view for booking summary (useful for admin dashboard)
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
    b.id,
    b.booking_reference,
    b.customer_name,
    b.customer_phone,
    b.event_date,
    b.event_time,
    b.service_type,
    b.selected_package_name,
    b.total_amount,
    b.advance_amount,
    b.booking_status,
    b.payment_status,
    b.created_at,
    p.name as package_name,
    p.price as package_price
FROM bookings b
LEFT JOIN packages p ON b.selected_package_id = p.id
ORDER BY b.created_at DESC;

-- Grant access to the view
GRANT SELECT ON booking_summary TO authenticated;