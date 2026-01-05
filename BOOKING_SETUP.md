# Celebration Point Booking System Setup

## Overview
This booking system allows customers to select celebration packages, add-ons, and complete their booking with a seamless user experience that matches your main website theme.

## Features
- 🎉 Service selection (Birthday, Romantic, Anniversary, Theatre)
- 📦 Dynamic package loading from Supabase
- 🎁 Optional add-ons selection
- 📱 Mobile-responsive design
- 💳 Booking form with validation
- 📊 Real-time booking summary
- 🔒 Secure data storage in Supabase

## Files Created
1. `booking.html` - Main booking page
2. `booking-styles.css` - Booking-specific styles
3. `booking-script.js` - Booking functionality
4. `supabase-setup.sql` - Database setup script
5. `BOOKING_SETUP.md` - This setup guide

## Supabase Setup Instructions

### Step 1: Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the SQL script to create tables and insert sample data

### Step 2: Verify Configuration
1. Check that your `config.js` file has the correct Supabase URL and anon key
2. Ensure the configuration is accessible in the booking page

### Step 3: Test the System
1. Open `booking.html` in your browser
2. Try selecting different services and packages
3. Fill out the booking form and submit
4. Check your Supabase dashboard to see if bookings are being stored

## Database Schema

### Tables Created:
- **packages**: Stores celebration packages
- **addons**: Stores optional add-ons
- **bookings**: Stores customer bookings

### Key Features:
- Row Level Security (RLS) enabled
- Public read access to packages and addons
- Public insert access for bookings
- Automatic timestamps with triggers
- Indexed for performance

## Package Data Structure

The system includes your provided packages:

### Birthday Packages:
- ₹599 Package (Basic)
- ₹799 Package (Popular) 
- ₹1399 Package (Premium)
- ₹1899 Premium Package (Luxury)

### Romantic Date Packages:
- Basic Romantic Date (₹399)
- Classic Date Setup (₹499)
- Candlelight Premium Date (₹699)
- Signature Date with Surprise Gift (₹999)

### Add-ons:
- Personal Photos & Videos on Screen (₹150)
- Full Photoshoot + 1 Free Instagram Reel (₹400)
- Flower Bouquet (₹100)

## Customization

### Adding New Packages:
```sql
INSERT INTO packages (id, name, price, duration, service_type, features, badge) VALUES
('new_package_id', 'Package Name', 999, '1 Hour', 'birthday', 
 ARRAY['Feature 1', 'Feature 2'], 'Badge Text');
```

### Adding New Add-ons:
```sql
INSERT INTO addons (id, name, description, price) VALUES
('new_addon_id', 'Add-on Name', 'Description', 199);
```

### Modifying Styles:
- Edit `booking-styles.css` to match your brand colors
- The current theme uses your existing color scheme (gold/cream)
- All animations and effects match your main website

## Booking Flow

1. **Service Selection**: Customer chooses celebration type
2. **Package Selection**: Browse and select packages
3. **Add-ons Selection**: Optional extras
4. **Form Completion**: Personal details and preferences
5. **Summary Review**: Real-time price calculation
6. **Submission**: Data stored in Supabase
7. **Confirmation**: Success modal with booking reference

## Mobile Optimization

The booking page is fully responsive with:
- Touch-friendly interface
- Optimized layouts for mobile
- Smooth animations
- Easy navigation

## Integration with Main Website

The booking page seamlessly integrates with your main website:
- Same navigation structure
- Consistent styling and fonts
- Matching color scheme
- Same background and effects

## Security Features

- Input validation and sanitization
- SQL injection protection via Supabase
- Row Level Security policies
- Secure data transmission

## Next Steps

1. **Payment Integration**: Add payment gateway (Razorpay, Stripe, etc.)
2. **Email Notifications**: Send confirmation emails
3. **Admin Dashboard**: Create admin panel for managing bookings
4. **SMS Integration**: Send booking confirmations via SMS
5. **Calendar Integration**: Check availability in real-time

## Support

For any issues or customizations:
- Check browser console for errors
- Verify Supabase connection
- Ensure all files are properly linked
- Test on different devices and browsers

## Booking Policy Implementation

The system includes your booking policies:
- No cancellation policy
- 20% advance payment calculation
- Terms and conditions checkbox
- Policy display in Hindi and English

Your booking system is now ready to handle customer celebrations! 🎉