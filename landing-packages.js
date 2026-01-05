/* ================================
   LANDING PAGE PACKAGE LOADER
   Loads packages and add-ons from database like booking page
================================ */
let supabase = null;
let packages = [];
let addons = [];
let selectedService = "birthday";

/* ================================
   SUPABASE INITIALIZATION
================================ */
function initializeSupabase() {
    try {
        if (window.SUPABASE_CONFIG && window.supabase) {
            supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase initialized for landing page');
            return true;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
    }
    
    console.warn('⚠️ Supabase not available');
    return false;
}

/* ================================
   TIER AND PREMIUM NAME FUNCTIONS
================================ */
function getTierFromPriceOrder(allPackages, currentPackage) {
    const servicePackages = allPackages
        .filter(pkg => pkg.service_type === currentPackage.service_type)
        .sort((a, b) => a.price - b.price);
    
    if (servicePackages.length === 1) return 'gold';
    
    const index = servicePackages.findIndex(pkg => pkg.id === currentPackage.id);
    const totalPackages = servicePackages.length;
    
    if (totalPackages === 2) {
        return index === 0 ? 'silver' : 'platinum';
    } else if (totalPackages === 3) {
        return ['silver', 'gold', 'platinum'][index];
    } else if (totalPackages >= 4) {
        return ['silver', 'gold', 'diamond', 'platinum'][index] || 'platinum';
    }
    
    return 'gold';
}

function getBadgeFromTier(tier) {
    const badges = {
        'silver': 'Most Loved',
        'gold': 'Luxury',
        'diamond': 'Elite',
        'platinum': 'Elite'
    };
    return badges[tier] || 'Popular';
}

function getPremiumName(tier, serviceType) {
    const names = {
        'birthday': {
            'silver': 'Silver Spark',
            'gold': 'Golden Glow', 
            'diamond': 'Diamond',
            'platinum': 'Platinum'
        },
        'romantic': {
            'silver': 'Silver Romance',
            'gold': 'Golden Romance',
            'diamond': 'Diamond Romance', 
            'platinum': 'Platinum Romance'
        },
        'anniversary': {
            'silver': 'Silver Anniversary',
            'gold': 'Golden Anniversary',
            'diamond': 'Diamond Anniversary',
            'platinum': 'Platinum Anniversary'
        },
        'theatre': {
            'silver': 'Silver Theatre',
            'gold': 'Golden Theatre',
            'diamond': 'Diamond Theatre',
            'platinum': 'Platinum Theatre'
        }
    };

    return names[serviceType]?.[tier] || `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}`;
}

function transformToPremiumPackage(pkg) {
    const tier = pkg.tier || getTierFromPriceOrder(packages, pkg);
    const premiumName = getPremiumName(tier, pkg.service_type);
    const badge = pkg.badge || getBadgeFromTier(tier);
    
    return {
        ...pkg,
        name: premiumName,
        tier: tier,
        badge: badge
    };
}

/* ================================
   LOAD PACKAGES FROM DATABASE
================================ */
async function loadPackages() {
    console.log('=== LOADING PACKAGES FROM DATABASE ===');
    try {
        showLoading('packagesLoading');
        
        if (supabase) {
            console.log('Fetching packages from Supabase...');
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .order('price', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                // Store raw packages first
                packages = data;
                // Transform database data to premium format AFTER all packages are loaded
                packages = packages.map(pkg => transformToPremiumPackage(pkg));
                console.log('✅ Loaded and transformed packages from database:', packages);
                renderPackages();
            } else {
                console.log('No packages found in database');
                showNoPackagesMessage();
            }
        } else {
            console.error('Supabase not initialized');
            showNoPackagesMessage();
        }
        
    } catch (error) {
        console.error('❌ Error loading packages from database:', error);
        showNoPackagesMessage();
    } finally {
        hideLoading('packagesLoading');
    }
}

/* ================================
   LOAD ADD-ONS FROM DATABASE
================================ */
async function loadAddons() {
    console.log('=== LOADING ADD-ONS FROM DATABASE ===');
    try {
        showLoading('addonsLoading');
        
        if (supabase) {
            console.log('Fetching add-ons from Supabase...');
            const { data, error } = await supabase
                .from('addons')
                .select('*')
                .order('price', { ascending: true });

            if (error) {
                console.error('Supabase add-ons error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                addons = data;
                console.log('✅ Loaded add-ons from database:', addons);
                renderAddons();
            } else {
                console.log('No add-ons found in database');
                showNoAddonsMessage();
            }
        } else {
            console.error('Supabase not initialized');
            showNoAddonsMessage();
        }
        
    } catch (error) {
        console.error('❌ Error loading add-ons from database:', error);
        showNoAddonsMessage();
    } finally {
        hideLoading('addonsLoading');
    }
}

/* ================================
   RENDER PACKAGES
================================ */
function renderPackages() {
    console.log('=== RENDERING PACKAGES ===');
    const container = document.getElementById("packagesContainer");
    
    if (!container) {
        console.error('Packages container not found!');
        return;
    }

    const filtered = packages.filter(p => p.service_type === selectedService);
    console.log(`Filtered packages for ${selectedService}:`, filtered);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-packages" style="text-align: center; padding: 40px; color: #fff;">
                <p>No packages available for ${selectedService} celebrations yet.</p>
                <p>Please contact us directly for custom arrangements.</p>
            </div>
        `;
        return;
    }

    const html = filtered.map(pkg => `
        <div class="premium-card ${pkg.tier}">
            ${pkg.badge ? `<div class="premium-badge">${pkg.badge}</div>` : ""}
            <div class="package-type">${selectedService.toUpperCase()} EXPERIENCE</div>
            <h3 class="premium-title">${pkg.name}</h3>
            <div class="price">₹ ${pkg.price.toLocaleString()}</div>
            <div class="divider"></div>
            <ul class="premium-features">
                ${(pkg.features || []).map(f => `<li>${f}</li>`).join("")}
            </ul>
            <div class="addon-note">${pkg.description || "Custom add-ons available"}</div>
            <button class="premium-btn" onclick="window.location.href='booking.html'">Reserve Experience</button>
        </div>
    `).join("");
    
    container.innerHTML = html;
    console.log('✅ Packages rendered successfully');
}

/* ================================
   RENDER ADD-ONS
================================ */
function renderAddons() {
    console.log('=== RENDERING ADD-ONS ===');
    const container = document.getElementById("addonsContainer");
    
    if (!container) {
        console.error('Add-ons container not found!');
        return;
    }

    if (addons.length === 0) {
        showNoAddonsMessage();
        return;
    }

    const html = addons.map(addon => `
        <div class="addon-card">
            <h4>${addon.name}</h4>
            <p>${addon.description || ""}</p>
            <div class="addon-price">₹ ${addon.price.toLocaleString()}</div>
            <button class="addon-btn" onclick="window.location.href='booking.html'">Add to Booking</button>
        </div>
    `).join("");
    
    container.innerHTML = html;
    console.log('✅ Add-ons rendered successfully');
}

/* ================================
   SERVICE TAB SWITCHING
================================ */
function switchService(service) {
    console.log('Switching to service:', service);
    selectedService = service;
    
    // Update active tab
    document.querySelectorAll('.service-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-service="${service}"]`).classList.add('active');
    
    // Re-render packages for new service
    renderPackages();
}

/* ================================
   UTILITY FUNCTIONS
================================ */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

function showNoPackagesMessage() {
    const container = document.getElementById("packagesContainer");
    if (container) {
        container.innerHTML = `
            <div class="no-packages" style="text-align: center; padding: 40px; color: #fff;">
                <p>Unable to load packages from database.</p>
                <p>Please refresh the page or contact us directly.</p>
            </div>
        `;
    }
}

function showNoAddonsMessage() {
    const container = document.getElementById("addonsContainer");
    if (container) {
        container.innerHTML = `
            <div class="no-addons" style="text-align: center; padding: 20px; color: #fff;">
                <p>Unable to load add-ons from database.</p>
                <p>Please refresh the page or contact us directly.</p>
            </div>
        `;
    }
}

/* ================================
   INITIALIZATION
================================ */
document.addEventListener("DOMContentLoaded", async () => {
    console.log('🚀 Landing page package loader starting...');
    
    // Check if required elements exist
    const container = document.getElementById("packagesContainer");
    const loadingState = document.getElementById("packagesLoading");
    
    console.log('Container found:', !!container);
    console.log('Loading state found:', !!loadingState);
    
    // Add service tab event listeners
    document.querySelectorAll('.service-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const service = tab.getAttribute('data-service');
            switchService(service);
        });
    });
    
    // Initialize Supabase and load data
    if (initializeSupabase()) {
        console.log('✅ Supabase initialized, loading from database...');
        await loadPackages();
        await loadAddons();
    } else {
        console.error('❌ Failed to initialize Supabase');
        showNoPackagesMessage();
        showNoAddonsMessage();
    }
});