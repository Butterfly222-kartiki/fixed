// Admin Panel Debug Script
// Add this to your admin.html to debug the issues

console.log('=== ADMIN PANEL DEBUG ===');

// Check if Supabase is loaded
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded');
} else {
    console.log('✅ Supabase library loaded');
}

// Check if config is available
if (typeof window.SUPABASE_CONFIG === 'undefined') {
    console.error('❌ Supabase config not found');
} else {
    console.log('✅ Supabase config found:', window.SUPABASE_CONFIG);
}

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        if (window.SUPABASE_CONFIG) {
            const supabaseClient = supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            
            console.log('Testing Supabase connection...');
            
            // Test packages table
            const { data: packages, error: packagesError } = await supabaseClient
                .from('packages')
                .select('count')
                .limit(1);
                
            if (packagesError) {
                console.error('❌ Packages table error:', packagesError);
            } else {
                console.log('✅ Packages table accessible');
            }
            
            // Test addons table
            const { data: addons, error: addonsError } = await supabaseClient
                .from('addons')
                .select('count')
                .limit(1);
                
            if (addonsError) {
                console.error('❌ Addons table error:', addonsError);
            } else {
                console.log('✅ Addons table accessible');
            }
            
        }
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
    }
}

// Test form functionality
function testPackageForm() {
    console.log('Testing package form...');
    
    const form = document.getElementById('packageForm');
    if (!form) {
        console.error('❌ Package form not found');
        return;
    }
    
    const requiredFields = ['packageName', 'packagePrice', 'packageDuration', 'packageServiceType'];
    const missingFields = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            missingFields.push(fieldId);
        }
    });
    
    if (missingFields.length > 0) {
        console.error('❌ Missing form fields:', missingFields);
    } else {
        console.log('✅ All package form fields found');
    }
}

function testAddonForm() {
    console.log('Testing addon form...');
    
    const form = document.getElementById('addonForm');
    if (!form) {
        console.error('❌ Addon form not found');
        return;
    }
    
    const requiredFields = ['addonName', 'addonPrice'];
    const missingFields = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            missingFields.push(fieldId);
        }
    });
    
    if (missingFields.length > 0) {
        console.error('❌ Missing addon form fields:', missingFields);
    } else {
        console.log('✅ All addon form fields found');
    }
}

// Test modal functionality
function testModals() {
    console.log('Testing modals...');
    
    const packageModal = document.getElementById('packageModal');
    const addonModal = document.getElementById('addonModal');
    
    if (!packageModal) {
        console.error('❌ Package modal not found');
    } else {
        console.log('✅ Package modal found');
    }
    
    if (!addonModal) {
        console.error('❌ Addon modal not found');
    } else {
        console.log('✅ Addon modal found');
    }
}

// Enhanced save functions with better error handling
async function debugSavePackage() {
    console.log('=== DEBUG SAVE PACKAGE ===');
    
    try {
        // Check form data
        const packageData = {
            name: document.getElementById('packageName').value,
            price: parseInt(document.getElementById('packagePrice').value),
            duration: document.getElementById('packageDuration').value,
            service_type: document.getElementById('packageServiceType').value,
            badge: document.getElementById('packageBadge').value || null,
            features: document.getElementById('packageFeatures').value.split('\n').filter(f => f.trim()),
            description: document.getElementById('packageDescription').value || null,
            is_active: document.getElementById('packageActive').checked
        };
        
        console.log('Package data to save:', packageData);
        
        // Validate required fields
        if (!packageData.name || !packageData.price || !packageData.duration || !packageData.service_type) {
            console.error('❌ Missing required fields');
            alert('Please fill in all required fields');
            return;
        }
        
        // Test Supabase save
        if (window.SUPABASE_CONFIG) {
            const supabaseClient = supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            
            packageData.id = `pkg_${Date.now()}`;
            
            console.log('Attempting to save to Supabase...');
            const { data, error } = await supabaseClient
                .from('packages')
                .insert([packageData])
                .select();
            
            if (error) {
                console.error('❌ Supabase save error:', error);
                alert(`Database error: ${error.message}`);
            } else {
                console.log('✅ Package saved successfully:', data);
                alert('Package saved successfully!');
            }
        } else {
            console.error('❌ Supabase config not available');
            alert('Database configuration error');
        }
        
    } catch (error) {
        console.error('❌ Save package error:', error);
        alert(`Error: ${error.message}`);
    }
}

async function debugSaveAddon() {
    console.log('=== DEBUG SAVE ADDON ===');
    
    try {
        // Check form data
        const addonData = {
            name: document.getElementById('addonName').value,
            price: parseInt(document.getElementById('addonPrice').value),
            description: document.getElementById('addonDescription').value || null,
            is_active: document.getElementById('addonActive').checked
        };
        
        console.log('Addon data to save:', addonData);
        
        // Validate required fields
        if (!addonData.name || !addonData.price) {
            console.error('❌ Missing required fields');
            alert('Please fill in all required fields');
            return;
        }
        
        // Test Supabase save
        if (window.SUPABASE_CONFIG) {
            const supabaseClient = supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            
            addonData.id = `addon_${Date.now()}`;
            
            console.log('Attempting to save to Supabase...');
            const { data, error } = await supabaseClient
                .from('addons')
                .insert([addonData])
                .select();
            
            if (error) {
                console.error('❌ Supabase save error:', error);
                alert(`Database error: ${error.message}`);
            } else {
                console.log('✅ Addon saved successfully:', data);
                alert('Addon saved successfully!');
            }
        } else {
            console.error('❌ Supabase config not available');
            alert('Database configuration error');
        }
        
    } catch (error) {
        console.error('❌ Save addon error:', error);
        alert(`Error: ${error.message}`);
    }
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Running admin panel diagnostics...');
        testSupabaseConnection();
        testPackageForm();
        testAddonForm();
        testModals();
        
        // Add debug buttons to test forms
        if (document.getElementById('packageModal')) {
            const debugBtn = document.createElement('button');
            debugBtn.textContent = 'Debug Save Package';
            debugBtn.onclick = debugSavePackage;
            debugBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px;';
            document.body.appendChild(debugBtn);
        }
        
        if (document.getElementById('addonModal')) {
            const debugBtn2 = document.createElement('button');
            debugBtn2.textContent = 'Debug Save Addon';
            debugBtn2.onclick = debugSaveAddon;
            debugBtn2.style.cssText = 'position: fixed; top: 60px; right: 10px; z-index: 9999; background: blue; color: white; padding: 10px;';
            document.body.appendChild(debugBtn2);
        }
        
    }, 2000);
});