// ================================
// REAL-TIME CONTENT LOADER
// Packages & Add-ons (Supabase)
// ================================

class RealtimeContentLoader {
    constructor() {
        this.supabase = null;
        this.packages = [];
        this.addons = [];
        this.init();
    }

    async init() {
        const SUPABASE_URL = window.SUPABASE_CONFIG?.url;
        const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey;

        if (!window.supabase || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.warn('Supabase not configured. Dynamic content disabled.');
            return;
        }

        this.supabase = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        await this.loadContent();
        this.setupRealtimeSubscriptions();
    }

    async loadContent() {
        await Promise.all([
            this.loadPackages(),
            this.loadAddons()
        ]);
    }

    // ================================
    // LOAD PACKAGES
    // ================================
    async loadPackages() {
        try {
            const { data, error } = await this.supabase
                .from('packages') // ✅ MATCH TABLE NAME
                .select('*')
                .order('price');

            if (error) throw error;

            this.packages = data || [];
            this.renderPackages();

        } catch (err) {
            console.error('Error loading packages:', err);
        }
    }

    // ================================
    // LOAD ADDONS
    // ================================
    async loadAddons() {
        try {
            const { data, error } = await this.supabase
                .from('addons') // ✅ MATCH TABLE NAME
                .select('*')
                .order('category');

            if (error) throw error;

            this.addons = data || [];
            this.renderAddons();

        } catch (err) {
            console.error('Error loading addons:', err);
        }
    }

    // ================================
    // RENDER PACKAGES
    // ================================
    renderPackages() {
        const container = document.querySelector('.packages-container');
        if (!container) return;

        if (!this.packages.length) {
            container.innerHTML = '<p style="color:#fff">No packages available</p>';
            return;
        }

        container.innerHTML = this.packages.map(pkg => {
            const features = Array.isArray(pkg.features)
                ? pkg.features
                : typeof pkg.features === 'string'
                    ? pkg.features.split(/[\n,]/).map(f => f.trim()).filter(Boolean)
                    : [];

            return `
                <div class="package-card" data-package='${JSON.stringify(pkg)}'>
                    <div class="package-card-inner">
                        <h3 class="package-title">${pkg.name}</h3>

                        <div class="package-price">
                            ₹${Number(pkg.price).toLocaleString()}
                        </div>

                        <p class="package-description">
                            ${pkg.description || ''}
                        </p>

                        <ul class="package-features">
                            ${features.map(f => `<li>${f}</li>`).join('')}
                        </ul>

                        <button class="package-btn">Book Now</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachPackageEvents();
        this.animateCards('.package-card');
    }

    // ================================
    // RENDER ADDONS
    // ================================
    renderAddons() {
        const container = document.querySelector('.addons-container');
        if (!container) return;

        if (!this.addons.length) {
            container.innerHTML = '<p>No add-ons available</p>';
            return;
        }

        container.innerHTML = this.addons.map(addon => {
            return `
                <div class="addon-card" data-addon='${JSON.stringify(addon)}'>
                    <div class="package-card-inner">
                        <h3 class="package-title">${addon.name}</h3>

                        <div class="package-price">
                            ₹${Number(addon.price).toLocaleString()}
                        </div>

                        <p class="package-description">
                            ${addon.description || ''}
                        </p>

                        <button class="package-btn">Add Now</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachAddonEvents();
        this.animateCards('.addon-card');
    }

    // ================================
    // EVENTS
    // ================================
    attachPackageEvents() {
        document.querySelectorAll('.package-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = e.target.closest('.package-card');
                if (!card) return;

                const pkg = JSON.parse(card.dataset.package);

                btn.style.transform = 'scale(0.9)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);

                if (window.customerAlert) {
                    window.customerAlert.show(`${pkg.name} selected`, 'success');
                }

                if (window.bookingSystem) {
                    window.bookingSystem.selectedPackage = pkg;
                    window.bookingSystem.updateCart();
                }

                const book = document.querySelector('#book');
                if (book) book.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    attachAddonEvents() {
        document.querySelectorAll('.addon-card .package-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = e.target.closest('.addon-card');
                if (!card) return;

                const addon = JSON.parse(card.dataset.addon);

                if (window.bookingSystem &&
                    !window.bookingSystem.selectedAddons?.find(a => a.id === addon.id)
                ) {
                    window.bookingSystem.selectedAddons.push(addon);
                    window.bookingSystem.updateCart();
                }

                const book = document.querySelector('#book');
                if (book) book.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ================================
    // ANIMATION
    // ================================
    animateCards(selector) {
        document.querySelectorAll(selector).forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, i * 120);
        });
    }

    // ================================
    // REALTIME
    // ================================
    setupRealtimeSubscriptions() {
        if (!this.supabase) return;

        this.supabase.channel('packages-live')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'packages' },
                () => this.loadPackages()
            )
            .subscribe();

        this.supabase.channel('addons-live')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'addons' },
                () => this.loadAddons()
            )
            .subscribe();
    }
}

// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.realtimeLoader = new RealtimeContentLoader();
    }, 500);
});
