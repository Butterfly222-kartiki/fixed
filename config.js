// Supabase Configuration
// Replace these with your actual Supabase credentials

const SUPABASE_CONFIG = {
    url: 'https://cilkuxkgsbyecllmjbhg.supabase.co', // e.g., 'https://your-project.supabase.co'
    anonKey: 'sb_publishable_ORofe1o3wOYH3BCjVABrVg_c2u5BWpT' // Your anon/public key
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}

// Make available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;