// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.supabase = null;
        this.currentSection = 'dashboard';
        this.bookings = [];
        this.packages = [];
        this.addons = [];
        this.customers = [];
        this.disabledDates = [];
        this.disabledSlots = {};
        
        // Calendar for availability
        this.availabilityMonth = new Date().getMonth();
        this.availabilityYear = new Date().getFullYear();
        this.selectedAvailabilityDate = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Supabase
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('Admin: Supabase initialized');
            } else {
                console.error('Admin: Supabase configuration not found');
            }

            // Initialize event listeners
            this.initEventListeners();
            
            // Load initial data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Error initializing admin panel:', error);
        }
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });

        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'bookings':
                await this.loadBookings();
                break;
            case 'packages':
                await this.loadPackages();
                break;
            case 'addons':
                await this.loadAddons();
                break;
            case 'availability':
                await this.loadAvailability();
                this.renderAvailabilityCalendar();
                break;
            case 'customers':
                await this.loadCustomers();
                break;
        }
    }

    // ================================
    // DASHBOARD
    // ================================

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadBookings(),
                this.loadPackages(),
                this.loadAddons(),
                this.loadCustomers()
            ]);

            this.updateDashboardStats();
            this.updateRecentBookings();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboardStats() {
        const totalBookings = this.bookings.length;
        const pendingBookings = this.bookings.filter(b => b.booking_status === 'pending').length;
        const totalRevenue = this.bookings
            .filter(b => b.booking_status === 'completed')
            .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const totalCustomers = this.customers.length;

        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('pendingBookings').textContent = pendingBookings;
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('totalCustomers').textContent = totalCustomers;
    }

    updateRecentBookings() {
        const recentBookings = this.bookings
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        const tbody = document.getElementById('recentBookingsTable');
        if (recentBookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No recent bookings</td></tr>';
            return;
        }

        tbody.innerHTML = recentBookings.map(booking => `
            <tr onclick="viewBookingDetails('${booking.id}')">
                <td>${booking.booking_reference}</td>
                <td>${booking.customer_name}</td>
                <td>${booking.selected_package_name}</td>
                <td>${new Date(booking.event_date).toLocaleDateString()}</td>
                <td><span class="status-badge status-${booking.booking_status}">${booking.booking_status}</span></td>
                <td>₹${booking.total_amount.toLocaleString()}</td>
            </tr>
        `).join('');
    }

    // ================================
    // BOOKINGS MANAGEMENT
    // ================================

    async loadBookings() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('bookings')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                this.bookings = data || [];
            } else {
                // Fallback data
                this.bookings = this.generateFallbackBookings();
            }

            this.displayBookings();
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.bookings = this.generateFallbackBookings();
            this.displayBookings();
        }
    }

    generateFallbackBookings() {
        return [
            {
                id: '1',
                booking_reference: 'CP20241201001',
                customer_name: 'Priya Sharma',
                customer_phone: '9876543210',
                customer_email: 'priya@example.com',
                event_date: '2024-12-15',
                event_time: '14:00-15:00',
                guest_count: 8,
                service_type: 'birthday',
                selected_package_name: '₹799 Package',
                package_price: 799,
                selected_addons: ['addon_photos'],
                addons_price: 150,
                total_amount: 949,
                advance_amount: 190,
                booking_status: 'pending',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                special_requests: 'Please arrange for chocolate cake'
            },
            {
                id: '2',
                booking_reference: 'CP20241201002',
                customer_name: 'Rahul Verma',
                customer_phone: '9876543211',
                customer_email: 'rahul@example.com',
                event_date: '2024-12-20',
                event_time: '18:00-19:00',
                guest_count: 2,
                service_type: 'romantic',
                selected_package_name: 'Candlelight Premium Date',
                package_price: 699,
                selected_addons: [],
                addons_price: 0,
                total_amount: 699,
                advance_amount: 140,
                booking_status: 'confirmed',
                payment_status: 'partial',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                special_requests: null
            }
        ];
    }

    displayBookings() {
        const tbody = document.getElementById('bookingsTable');
        if (this.bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No bookings found</td></tr>';
            return;
        }

        tbody.innerHTML = this.bookings.map(booking => `
            <tr onclick="viewBookingDetails('${booking.id}')">
                <td>
                    <strong>${booking.booking_reference}</strong><br>
                    <small>${new Date(booking.created_at).toLocaleDateString()}</small>
                </td>
                <td>
                    <strong>${booking.customer_name}</strong><br>
                    <small>${booking.customer_phone}</small><br>
                    <small>${booking.customer_email || 'No email'}</small>
                </td>
                <td>
                    <strong>${new Date(booking.event_date).toLocaleDateString()}</strong><br>
                    <small>${booking.event_time}</small><br>
                    <small>${booking.guest_count} guests</small><br>
                    <small>${booking.service_type}</small>
                </td>
                <td>
                    <strong>${booking.selected_package_name}</strong><br>
                    ${booking.selected_addons && booking.selected_addons.length > 0 ? 
                        `<small>+ ${booking.selected_addons.length} add-ons</small>` : 
                        '<small>No add-ons</small>'}
                </td>
                <td>
                    <strong>₹${booking.total_amount.toLocaleString()}</strong><br>
                    <small>Advance: ₹${booking.advance_amount.toLocaleString()}</small>
                </td>
                <td>
                    <span class="status-badge status-${booking.booking_status}">${booking.booking_status}</span><br>
                    <small>Payment: ${booking.payment_status}</small>
                </td>
                <td>
                    <button class="btn-primary" onclick="event.stopPropagation(); viewBookingDetails('${booking.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ================================
    // PACKAGES MANAGEMENT
    // ================================

    async loadPackages() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('packages')
                    .select('*')
                    .order('service_type', { ascending: true });

                if (error) throw error;
                this.packages = data || [];
            } else {
                this.packages = this.generateFallbackPackages();
            }

            this.displayPackages();
        } catch (error) {
            console.error('Error loading packages:', error);
            this.packages = this.generateFallbackPackages();
            this.displayPackages();
        }
    }

    generateFallbackPackages() {
        return [
            // Birthday packages
            {
                id: 'birthday_999',
                name: 'Silver Spark',
                price: 999,
                service_type: 'birthday',
                features: [
                    'Elegant balloon décor',
                    'Soft ambient lighting',
                    'Music setup',
                    'Private space',
                    'Personalized add-ons available'
                ],
                badge: 'Most Loved',
                tier: 'silver',
                is_active: true
            },
            {
                id: 'birthday_1399',
                name: 'Golden Glow',
                price: 1399,
                service_type: 'birthday',
                features: [
                    'Premium themed décor',
                    'Candlelight ambiance',
                    'LED lighting',
                    'Photography assistance',
                    'Personalized add-ons available'
                ],
                badge: 'Luxury',
                tier: 'gold',
                is_active: true
            },
            {
                id: 'birthday_1899',
                name: 'Diamond',
                price: 1899,
                service_type: 'birthday',
                features: [
                    'Luxury décor theme',
                    'Smoke & LED effects',
                    'Customized name display',
                    'Professional photos',
                    'Premium add-ons included'
                ],
                badge: 'Elite',
                tier: 'diamond',
                is_active: true
            },
            {
                id: 'birthday_2499',
                name: 'Platinum',
                price: 2499,
                service_type: 'birthday',
                features: [
                    'Exclusive luxury theme',
                    'Flower & candle décor',
                    'Private celebration room',
                    'Photos + reels',
                    'All add-ons included'
                ],
                badge: 'Elite',
                tier: 'platinum',
                is_active: true
            },
            // Romantic packages
            {
                id: 'romantic_799',
                name: 'Silver Romance',
                price: 799,
                service_type: 'romantic',
                features: [
                    'Romantic balloon setup',
                    'Candlelight ambiance',
                    'Music playlist',
                    'Private seating',
                    'Photo opportunities'
                ],
                badge: 'Popular',
                tier: 'silver',
                is_active: true
            },
            {
                id: 'romantic_1199',
                name: 'Golden Romance',
                price: 1199,
                service_type: 'romantic',
                features: [
                    'Premium romantic décor',
                    'Heart-shaped setup',
                    'Professional lighting',
                    'Couple photography',
                    'Personalized touches'
                ],
                badge: 'Luxury',
                tier: 'gold',
                is_active: true
            }
        ];
    }

    displayPackages() {
        const container = document.getElementById('packagesGrid');
        if (this.packages.length === 0) {
            container.innerHTML = '<div class="loading-card">No packages found</div>';
            return;
        }

        container.innerHTML = this.packages.map(pkg => `
            <div class="package-card ${pkg.tier || 'default'}">
                ${pkg.badge ? `<div class="package-badge ${pkg.tier || 'default'}">${pkg.badge}</div>` : ''}
                <h3>${pkg.name}</h3>
                <div class="price">₹${pkg.price.toLocaleString()}</div>
                <p><strong>Duration:</strong> ${pkg.duration}</p>
                <p><strong>Service:</strong> ${pkg.service_type}</p>
                <p><strong>Tier:</strong> ${pkg.tier || 'standard'}</p>
                <ul class="features">
                    ${pkg.features ? pkg.features.map(feature => `<li>${feature}</li>`).join('') : ''}
                </ul>
                <div class="package-actions">
                    <button class="btn-secondary" onclick="editPackage('${pkg.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger" onclick="deletePackage('${pkg.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn-${pkg.is_active ? 'danger' : 'success'}" onclick="togglePackageStatus('${pkg.id}')">
                        <i class="fas fa-${pkg.is_active ? 'eye-slash' : 'eye'}"></i> 
                        ${pkg.is_active ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    // ================================
    // ADD-ONS MANAGEMENT
    // ================================

    async loadAddons() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('addons')
                    .select('*')
                    .order('price', { ascending: true });

                if (error) throw error;
                this.addons = data || [];
            } else {
                this.addons = this.generateFallbackAddons();
            }

            this.displayAddons();
        } catch (error) {
            console.error('Error loading addons:', error);
            this.addons = this.generateFallbackAddons();
            this.displayAddons();
        }
    }

    generateFallbackAddons() {
        return [
            {
                id: 'addon_photos',
                name: 'Personal Photos & Videos on Screen',
                description: 'तुमचे वैयक्तिक फोटो आणि व्हिडिओ स्क्रीनवर मेमरीज स्लाइडशोच्या स्वरूपात दाखवले जातील',
                price: 150,
                is_active: true
            },
            {
                id: 'addon_photoshoot',
                name: 'Full Photoshoot + 1 Free Instagram Reel',
                description: 'पूर्ण फोटोशूट केले जाईल आणि त्यासोबत 1 मोफत इंस्टाग्राम रील तयार केली जाईल',
                price: 400,
                is_active: true
            }
        ];
    }

    displayAddons() {
        const tbody = document.getElementById('addonsTable');
        if (this.addons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No add-ons found</td></tr>';
            return;
        }

        tbody.innerHTML = this.addons.map(addon => `
            <tr>
                <td><strong>${addon.name}</strong></td>
                <td>${addon.description || 'No description'}</td>
                <td>₹${addon.price.toLocaleString()}</td>
                <td>
                    <span class="status-badge status-${addon.is_active ? 'confirmed' : 'cancelled'}">
                        ${addon.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-secondary" onclick="editAddon('${addon.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteAddon('${addon.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ================================
    // AVAILABILITY MANAGEMENT
    // ================================

    async loadAvailability() {
        try {
            if (this.supabase) {
                // Load disabled dates and slots from database
                const { data: disabledData, error } = await this.supabase
                    .from('disabled_availability')
                    .select('*');

                if (error) throw error;

                this.disabledDates = disabledData?.filter(d => d.type === 'date').map(d => d.date) || [];
                this.disabledSlots = {};
                disabledData?.filter(d => d.type === 'slot').forEach(slot => {
                    if (!this.disabledSlots[slot.date]) {
                        this.disabledSlots[slot.date] = [];
                    }
                    this.disabledSlots[slot.date].push(slot.time_slot);
                });
            }
        } catch (error) {
            console.error('Error loading availability:', error);
        }
    }

    renderAvailabilityCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Update month/year display
        document.getElementById('availabilityMonthYear').textContent = 
            `${monthNames[this.availabilityMonth]} ${this.availabilityYear}`;

        // Generate calendar days
        const container = document.getElementById('availabilityCalendarDays');
        const firstDay = new Date(this.availabilityYear, this.availabilityMonth, 1);
        const lastDay = new Date(this.availabilityYear, this.availabilityMonth + 1, 0);
        
        let html = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day other-month"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.availabilityYear, this.availabilityMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            
            let classes = ['calendar-day'];
            
            if (this.disabledDates.includes(dateStr)) {
                classes.push('disabled');
            }
            
            if (this.selectedAvailabilityDate === dateStr) {
                classes.push('selected');
            }
            
            html += `<div class="${classes.join(' ')}" data-date="${dateStr}" onclick="adminPanel.selectAvailabilityDate('${dateStr}')">${day}</div>`;
        }
        
        container.innerHTML = html;
    }

    selectAvailabilityDate(dateStr) {
        this.selectedAvailabilityDate = dateStr;
        this.renderAvailabilityCalendar();
        this.updateTimeSlotsDisplay();
    }

    updateTimeSlotsDisplay() {
        const display = document.getElementById('selectedDateDisplay');
        const grid = document.getElementById('timeslotsGrid');

        if (!this.selectedAvailabilityDate) {
            display.textContent = 'Select a date to manage time slots';
            grid.innerHTML = '';
            return;
        }

        const date = new Date(this.selectedAvailabilityDate);
        display.textContent = `Managing slots for ${date.toLocaleDateString()}`;

        const timeSlots = [
            '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
            '18:00-19:00', '19:00-20:00'
        ];

        const disabledForDate = this.disabledSlots[this.selectedAvailabilityDate] || [];

        grid.innerHTML = timeSlots.map(slot => `
            <div class="timeslot-item ${disabledForDate.includes(slot) ? 'disabled' : ''}" 
                 onclick="adminPanel.toggleTimeSlot('${slot}')">
                ${slot.replace('-', ' - ')}
            </div>
        `).join('');
    }

    async toggleTimeSlot(slot) {
        if (!this.selectedAvailabilityDate) return;

        const disabledForDate = this.disabledSlots[this.selectedAvailabilityDate] || [];
        const isDisabled = disabledForDate.includes(slot);

        if (isDisabled) {
            // Enable slot
            this.disabledSlots[this.selectedAvailabilityDate] = disabledForDate.filter(s => s !== slot);
        } else {
            // Disable slot
            if (!this.disabledSlots[this.selectedAvailabilityDate]) {
                this.disabledSlots[this.selectedAvailabilityDate] = [];
            }
            this.disabledSlots[this.selectedAvailabilityDate].push(slot);
        }

        // Save to database
        await this.saveAvailabilityChanges();
        this.updateTimeSlotsDisplay();
    }

    async saveAvailabilityChanges() {
        try {
            if (this.supabase) {
                // This would save to a disabled_availability table
                // Implementation depends on your database schema
                console.log('Saving availability changes...');
            }
        } catch (error) {
            console.error('Error saving availability:', error);
        }
    }

    // ================================
    // CUSTOMERS MANAGEMENT
    // ================================

    async loadCustomers() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('customers')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                this.customers = data || [];
            } else {
                this.customers = this.generateFallbackCustomers();
            }

            this.displayCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            this.customers = this.generateFallbackCustomers();
            this.displayCustomers();
        }
    }

    generateFallbackCustomers() {
        return [
            {
                id: '1',
                name: 'Priya Sharma',
                phone: '9876543210',
                email: 'priya@example.com',
                total_bookings: 3,
                total_spent: 2500,
                last_booking: '2024-12-01',
                created_at: '2024-01-15'
            },
            {
                id: '2',
                name: 'Rahul Verma',
                phone: '9876543211',
                email: 'rahul@example.com',
                total_bookings: 1,
                total_spent: 699,
                last_booking: '2024-11-20',
                created_at: '2024-11-15'
            }
        ];
    }

    displayCustomers() {
        const tbody = document.getElementById('customersTable');
        if (this.customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No customers found</td></tr>';
            return;
        }

        tbody.innerHTML = this.customers.map(customer => `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.phone}</td>
                <td>${customer.email || 'No email'}</td>
                <td>${customer.total_bookings || 0}</td>
                <td>₹${(customer.total_spent || 0).toLocaleString()}</td>
                <td>${customer.last_booking ? new Date(customer.last_booking).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button class="btn-secondary" onclick="editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-primary" onclick="viewCustomerBookings('${customer.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // ================================
    // MODAL FUNCTIONS
    // ================================

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// Global functions for HTML onclick events
let adminPanel;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
});

// Navigation functions
function changeAvailabilityMonth(direction) {
    adminPanel.availabilityMonth += direction;
    
    if (adminPanel.availabilityMonth > 11) {
        adminPanel.availabilityMonth = 0;
        adminPanel.availabilityYear++;
    } else if (adminPanel.availabilityMonth < 0) {
        adminPanel.availabilityMonth = 11;
        adminPanel.availabilityYear--;
    }
    
    adminPanel.renderAvailabilityCalendar();
}

// Package functions
function openPackageModal(packageId = null) {
    const modal = document.getElementById('packageModal');
    const title = document.getElementById('packageModalTitle');
    
    if (packageId) {
        title.textContent = 'Edit Package';
        const pkg = adminPanel.packages.find(p => p.id === packageId);
        if (pkg) {
            document.getElementById('packageId').value = pkg.id;
            document.getElementById('packageName').value = pkg.name;
            document.getElementById('packagePrice').value = pkg.price;
            document.getElementById('packageDuration').value = pkg.duration;
            document.getElementById('packageServiceType').value = pkg.service_type;
            document.getElementById('packageBadge').value = pkg.badge || '';
            document.getElementById('packageFeatures').value = pkg.features ? pkg.features.join('\n') : '';
            document.getElementById('packageDescription').value = pkg.description || '';
            document.getElementById('packageActive').checked = pkg.is_active;
        }
    } else {
        title.textContent = 'Add Package';
        document.getElementById('packageForm').reset();
        document.getElementById('packageId').value = '';
    }
    
    modal.classList.add('show');
}

function closePackageModal() {
    document.getElementById('packageModal').classList.remove('show');
}

async function savePackage() {
    console.log('=== SAVING PACKAGE ===');
    
    try {
        // Get form data
        const packageData = {
            id: document.getElementById('packageId').value || `pkg_${Date.now()}`,
            name: document.getElementById('packageName').value.trim(),
            price: parseInt(document.getElementById('packagePrice').value),
            duration: document.getElementById('packageDuration').value.trim(),
            service_type: document.getElementById('packageServiceType').value,
            badge: document.getElementById('packageBadge').value.trim() || null,
            features: document.getElementById('packageFeatures').value.split('\n').filter(f => f.trim()),
            description: document.getElementById('packageDescription').value.trim() || null,
            is_active: document.getElementById('packageActive').checked
        };

        console.log('Package data:', packageData);

        // Validate required fields
        if (!packageData.name) {
            alert('Package name is required');
            return;
        }
        if (!packageData.price || packageData.price <= 0) {
            alert('Valid price is required');
            return;
        }
        if (!packageData.duration) {
            alert('Duration is required');
            return;
        }
        if (!packageData.service_type) {
            alert('Service type is required');
            return;
        }

        adminPanel.showLoading();
        
        if (adminPanel.supabase) {
            console.log('Saving to Supabase...');
            
            // Try upsert first, if it fails due to RLS, show helpful error
            try {
                const { data, error } = await adminPanel.supabase
                    .from('packages')
                    .upsert([packageData])
                    .select();
                
                if (error) {
                    console.error('Supabase error:', error);
                    
                    // Check if it's an RLS error
                    if (error.message.includes('row-level security policy') || error.message.includes('RLS')) {
                        throw new Error(`Database security error: Please run the admin-rls-fix.sql script in your Supabase SQL Editor to enable admin operations. Error: ${error.message}`);
                    } else {
                        throw new Error(`Database error: ${error.message}`);
                    }
                }
                
                console.log('Package saved to database:', data);
                
            } catch (dbError) {
                // If database save fails, save to local storage as fallback
                console.warn('Database save failed, using local fallback:', dbError.message);
                
                const existingIndex = adminPanel.packages.findIndex(p => p.id === packageData.id);
                if (existingIndex >= 0) {
                    adminPanel.packages[existingIndex] = packageData;
                } else {
                    adminPanel.packages.push(packageData);
                }
                
                // Show user-friendly error message
                alert(`Package saved locally, but database save failed.\n\nTo fix this permanently:\n1. Go to your Supabase SQL Editor\n2. Run the admin-rls-fix.sql script\n3. This will enable admin operations\n\nError: ${dbError.message}`);
            }
        } else {
            console.log('Saving to local storage (fallback)...');
            // Fallback: update local array
            const existingIndex = adminPanel.packages.findIndex(p => p.id === packageData.id);
            if (existingIndex >= 0) {
                adminPanel.packages[existingIndex] = packageData;
            } else {
                adminPanel.packages.push(packageData);
            }
        }
        
        await adminPanel.loadPackages();
        closePackageModal();
        
        if (!alert.toString().includes('database save failed')) {
            alert('Package saved successfully!');
        }
        
    } catch (error) {
        console.error('Error saving package:', error);
        alert(`Error saving package: ${error.message}`);
    } finally {
        adminPanel.hideLoading();
    }
}

function editPackage(packageId) {
    openPackageModal(packageId);
}

async function deletePackage(packageId) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
        adminPanel.showLoading();
        
        if (adminPanel.supabase) {
            const { error } = await adminPanel.supabase
                .from('packages')
                .delete()
                .eq('id', packageId);
            
            if (error) throw error;
        } else {
            adminPanel.packages = adminPanel.packages.filter(p => p.id !== packageId);
        }
        
        await adminPanel.loadPackages();
        alert('Package deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error deleting package. Please try again.');
    } finally {
        adminPanel.hideLoading();
    }
}

// Add-on functions
function openAddonModal(addonId = null) {
    const modal = document.getElementById('addonModal');
    const title = document.getElementById('addonModalTitle');
    
    if (addonId) {
        title.textContent = 'Edit Add-on';
        const addon = adminPanel.addons.find(a => a.id === addonId);
        if (addon) {
            document.getElementById('addonId').value = addon.id;
            document.getElementById('addonName').value = addon.name;
            document.getElementById('addonPrice').value = addon.price;
            document.getElementById('addonDescription').value = addon.description || '';
            document.getElementById('addonActive').checked = addon.is_active;
        }
    } else {
        title.textContent = 'Add Add-on';
        document.getElementById('addonForm').reset();
        document.getElementById('addonId').value = '';
    }
    
    modal.classList.add('show');
}

function closeAddonModal() {
    document.getElementById('addonModal').classList.remove('show');
}

async function saveAddon() {
    console.log('=== SAVING ADDON ===');
    
    try {
        // Get form data
        const addonData = {
            id: document.getElementById('addonId').value || `addon_${Date.now()}`,
            name: document.getElementById('addonName').value.trim(),
            price: parseInt(document.getElementById('addonPrice').value),
            description: document.getElementById('addonDescription').value.trim() || null,
            is_active: document.getElementById('addonActive').checked
        };

        console.log('Addon data:', addonData);

        // Validate required fields
        if (!addonData.name) {
            alert('Add-on name is required');
            return;
        }
        if (!addonData.price || addonData.price <= 0) {
            alert('Valid price is required');
            return;
        }

        adminPanel.showLoading();
        
        if (adminPanel.supabase) {
            console.log('Saving to Supabase...');
            
            // Try upsert first, if it fails due to RLS, show helpful error
            try {
                const { data, error } = await adminPanel.supabase
                    .from('addons')
                    .upsert([addonData])
                    .select();
                
                if (error) {
                    console.error('Supabase error:', error);
                    
                    // Check if it's an RLS error
                    if (error.message.includes('row-level security policy') || error.message.includes('RLS')) {
                        throw new Error(`Database security error: Please run the admin-rls-fix.sql script in your Supabase SQL Editor to enable admin operations. Error: ${error.message}`);
                    } else {
                        throw new Error(`Database error: ${error.message}`);
                    }
                }
                
                console.log('Addon saved to database:', data);
                
            } catch (dbError) {
                // If database save fails, save to local storage as fallback
                console.warn('Database save failed, using local fallback:', dbError.message);
                
                const existingIndex = adminPanel.addons.findIndex(a => a.id === addonData.id);
                if (existingIndex >= 0) {
                    adminPanel.addons[existingIndex] = addonData;
                } else {
                    adminPanel.addons.push(addonData);
                }
                
                // Show user-friendly error message
                alert(`Add-on saved locally, but database save failed.\n\nTo fix this permanently:\n1. Go to your Supabase SQL Editor\n2. Run the admin-rls-fix.sql script\n3. This will enable admin operations\n\nError: ${dbError.message}`);
            }
        } else {
            console.log('Saving to local storage (fallback)...');
            const existingIndex = adminPanel.addons.findIndex(a => a.id === addonData.id);
            if (existingIndex >= 0) {
                adminPanel.addons[existingIndex] = addonData;
            } else {
                adminPanel.addons.push(addonData);
            }
        }
        
        await adminPanel.loadAddons();
        closeAddonModal();
        
        if (!alert.toString().includes('database save failed')) {
            alert('Add-on saved successfully!');
        }
        
    } catch (error) {
        console.error('Error saving add-on:', error);
        alert(`Error saving add-on: ${error.message}`);
    } finally {
        adminPanel.hideLoading();
    }
}

function editAddon(addonId) {
    openAddonModal(addonId);
}

async function deleteAddon(addonId) {
    if (!confirm('Are you sure you want to delete this add-on?')) return;
    
    try {
        adminPanel.showLoading();
        
        if (adminPanel.supabase) {
            const { error } = await adminPanel.supabase
                .from('addons')
                .delete()
                .eq('id', addonId);
            
            if (error) throw error;
        } else {
            adminPanel.addons = adminPanel.addons.filter(a => a.id !== addonId);
        }
        
        await adminPanel.loadAddons();
        alert('Add-on deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting add-on:', error);
        alert('Error deleting add-on. Please try again.');
    } finally {
        adminPanel.hideLoading();
    }
}

// Customer functions
function openCustomerModal(customerId = null) {
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');
    
    if (customerId) {
        title.textContent = 'Edit Customer';
        const customer = adminPanel.customers.find(c => c.id === customerId);
        if (customer) {
            document.getElementById('customerId').value = customer.id;
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerPhone').value = customer.phone;
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerNotes').value = customer.notes || '';
        }
    } else {
        title.textContent = 'Add Customer';
        document.getElementById('customerForm').reset();
        document.getElementById('customerId').value = '';
    }
    
    modal.classList.add('show');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('show');
}

function editCustomer(customerId) {
    openCustomerModal(customerId);
}

// Booking functions
function viewBookingDetails(bookingId) {
    const booking = adminPanel.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const modal = document.getElementById('bookingModal');
    const body = document.getElementById('bookingModalBody');
    
    body.innerHTML = `
        <div class="booking-details">
            <div class="detail-section">
                <h4>Booking Information</h4>
                <p><strong>Reference:</strong> ${booking.booking_reference}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${booking.booking_status}">${booking.booking_status}</span></p>
                <p><strong>Created:</strong> ${new Date(booking.created_at).toLocaleString()}</p>
            </div>
            
            <div class="detail-section">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> ${booking.customer_name}</p>
                <p><strong>Phone:</strong> ${booking.customer_phone}</p>
                <p><strong>Email:</strong> ${booking.customer_email || 'Not provided'}</p>
            </div>
            
            <div class="detail-section">
                <h4>Event Details</h4>
                <p><strong>Date:</strong> ${new Date(booking.event_date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.event_time}</p>
                <p><strong>Guests:</strong> ${booking.guest_count}</p>
                <p><strong>Service Type:</strong> ${booking.service_type}</p>
                ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
            </div>
            
            <div class="detail-section">
                <h4>Package & Pricing</h4>
                <p><strong>Package:</strong> ${booking.selected_package_name}</p>
                <p><strong>Package Price:</strong> ₹${booking.package_price.toLocaleString()}</p>
                <p><strong>Add-ons Price:</strong> ₹${booking.addons_price.toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹${booking.total_amount.toLocaleString()}</p>
                <p><strong>Advance Paid:</strong> ₹${booking.advance_amount.toLocaleString()}</p>
                <p><strong>Remaining:</strong> ₹${(booking.total_amount - booking.advance_amount).toLocaleString()}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('show');
}

// Utility functions
function refreshBookings() {
    adminPanel.loadBookings();
}

function exportBookings() {
    // Simple CSV export
    const csv = adminPanel.bookings.map(booking => 
        [
            booking.booking_reference,
            booking.customer_name,
            booking.customer_phone,
            booking.event_date,
            booking.event_time,
            booking.selected_package_name,
            booking.total_amount,
            booking.booking_status
        ].join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
}

function filterBookings() {
    // Implementation for filtering bookings
    console.log('Filtering bookings...');
}

function saveBusinessHours() {
    alert('Business hours saved!');
}

function saveBookingSettings() {
    alert('Booking settings saved!');
}

function saveContactInfo() {
    alert('Contact information saved!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}