// Supabase Configuration
// Replace these with your actual Supabase credentials

const SUPABASE_CONFIG = {
    url:   "https://bsdotvcbwaqtxgjlibkr.supabase.co",
 
    anonKey:  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZG90dmNid2FxdHhnamxpYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzI4MzIsImV4cCI6MjA4MzEwODgzMn0.aJvpBGjKWJ7wvt3Ko9MjeM4v3AKq_wcL-dpVV13WgC0" // Your anon/public key
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}

// Make available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;