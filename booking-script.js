// Force clear browser cache and reload with new premium design
console.log('=== PREMIUM CARDS SYSTEM v4.0 - DATABASE ENABLED ===');

// Booking Wizard System JavaScript
class BookingWizard {
    constructor() {
        this.supabase = null;
        this.currentStep = 1;
        this.totalSteps = 5;
        
        // Booking data
        this.selectedService = 'birthday';
        this.selectedPackage = null;
        this.selectedAddons = [];
        this.selectedDate = null;
        this.selectedTime = null;
        this.personalDetails = {};
        
        // Data arrays - Will be loaded from database
        this.packages = [];
        this.addons = [];
        this.bookedSlots = {}; // Format: { 'YYYY-MM-DD': ['10:00-11:00', '14:00-15:00'] }
        
        // Calendar
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        
        this.init();
    }

    loadPremiumPackages() {
        console.log('=== LOADING PREMIUM PACKAGES ===');
        this.packages = [
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
                tier: 'silver'
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
                tier: 'gold'
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
                tier: 'diamond'
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
                tier: 'platinum'
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
                tier: 'silver'
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
                tier: 'gold'
            },
            {
                id: 'romantic_1599',
                name: 'Diamond Romance',
                price: 1599,
                service_type: 'romantic',
                features: [
                    'Luxury romantic theme',
                    'LED & candle effects',
                    'Premium food coverage',
                    'Professional photoshoot',
                    'Video memories'
                ],
                badge: 'Elite',
                tier: 'diamond'
            },
            {
                id: 'romantic_1999',
                name: 'Platinum Romance',
                price: 1999,
                service_type: 'romantic',
                features: [
                    'Ultra-luxury romantic setup',
                    'Exclusive private room',
                    'Gourmet dining',
                    'Complete photo & video',
                    'All premium add-ons'
                ],
                badge: 'Elite',
                tier: 'platinum'
            },
            // Anniversary packages
            {
                id: 'anniversary_1299',
                name: 'Silver Anniversary',
                price: 1299,
                service_type: 'anniversary',
                features: [
                    'Elegant anniversary décor',
                    'Celebration cake',
                    'Music & lighting',
                    'Memory displays',
                    'Photo session'
                ],
                badge: 'Popular',
                tier: 'silver'
            },
            {
                id: 'anniversary_1799',
                name: 'Golden Anniversary',
                price: 1799,
                service_type: 'anniversary',
                features: [
                    'Premium anniversary theme',
                    'Luxury cake & treats',
                    'Professional setup',
                    'Photography service',
                    'Personalized touches'
                ],
                badge: 'Luxury',
                tier: 'gold'
            },
            {
                id: 'anniversary_2299',
                name: 'Diamond Anniversary',
                price: 2299,
                service_type: 'anniversary',
                features: [
                    'Luxury anniversary celebration',
                    'Premium beverages',
                    'Professional photography',
                    'Live entertainment',
                    'Complete documentation'
                ],
                badge: 'Elite',
                tier: 'diamond'
            },
            {
                id: 'anniversary_2799',
                name: 'Platinum Anniversary',
                price: 2799,
                service_type: 'anniversary',
                features: [
                    'Ultra-luxury celebration',
                    'Exclusive venue setup',
                    'Gourmet experience',
                    'Complete media coverage',
                    'All premium services'
                ],
                badge: 'Elite',
                tier: 'platinum'
            },
            // Theatre packages
            {
                id: 'theatre_899',
                name: 'Silver Theatre',
                price: 899,
                service_type: 'theatre',
                features: [
                    'Private theatre room',
                    'Movie selection',
                    'Snacks & beverages',
                    'Comfortable seating',
                    'Basic amenities'
                ],
                badge: 'Popular',
                tier: 'silver'
            },
            {
                id: 'theatre_1299',
                name: 'Golden Theatre',
                price: 1299,
                service_type: 'theatre',
                features: [
                    'Premium theatre experience',
                    'Gourmet snacks',
                    'Luxury seating',
                    'Enhanced sound system',
                    'Personalized service'
                ],
                badge: 'Luxury',
                tier: 'gold'
            },
            {
                id: 'theatre_1699',
                name: 'Diamond Theatre',
                price: 1699,
                service_type: 'theatre',
                features: [
                    'VIP theatre suite',
                    'Premium dining',
                    'Recliner seating',
                    'Surround sound',
                    'Concierge service'
                ],
                badge: 'Elite',
                tier: 'diamond'
            },
            {
                id: 'theatre_2199',
                name: 'Platinum Theatre',
                price: 2199,
                service_type: 'theatre',
                features: [
                    'Ultra-luxury theatre suite',
                    'Gourmet dining experience',
                    'Premium recliners',
                    'Dolby Atmos sound',
                    'Complete luxury service'
                ],
                badge: 'Elite',
                tier: 'platinum'
            }
        ];
        
        console.log('Premium packages loaded:', this.packages.length);
        
        // Force display packages immediately
        setTimeout(() => {
            this.displayPackages();
        }, 100);
    }

    async init() {
        try {
            console.log('Initializing booking wizard...');
            
            // Initialize Supabase
            if (window.SUPABASE_CONFIG) {
                this.supabase = supabase.createClient(
                    window.SUPABASE_CONFIG.url,
                    window.SUPABASE_CONFIG.anonKey
                );
                console.log('Supabase initialized successfully');
            } else {
                console.error('Supabase configuration not found');
            }

            // Initialize event listeners
            this.initEventListeners();
            
            // Load initial data
            console.log('Loading packages...');
            await this.loadPackages();
            
            console.log('Loading addons...');
            await this.loadAddons();
            
            console.log('Loading booked slots...');
            await this.loadBookedSlots();
            
            // Initialize calendar
            console.log('Rendering calendar...');
            this.renderCalendar();
            
            console.log('Booking wizard initialized successfully');
            
        } catch (error) {
            console.error('Error initializing booking wizard:', error);
            this.showError('Failed to initialize booking system');
        }
    }

    initEventListeners() {
        // Service tab selection
        document.querySelectorAll('.service-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.selectService(e.target.closest('.service-tab').dataset.service);
            });
        });

        // Step navigation
        document.getElementById('step1Next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('step2Prev')?.addEventListener('click', () => this.prevStep());
        document.getElementById('step2Next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('step3Prev')?.addEventListener('click', () => this.prevStep());
        document.getElementById('step3Next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('step4Prev')?.addEventListener('click', () => this.prevStep());
        document.getElementById('step4Next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('step5Prev')?.addEventListener('click', () => this.prevStep());
        document.getElementById('finalBookBtn')?.addEventListener('click', () => this.submitBooking());

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));

        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
                e.target.closest('.payment-option').classList.add('active');
            });
        });

        // Form validation
        document.getElementById('personalDetailsForm')?.addEventListener('input', () => {
            this.validatePersonalDetails();
        });

        // Modal close
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalOkBtn')?.addEventListener('click', () => this.closeModal());
    }

    // ================================
    // STEP NAVIGATION
    // ================================
    
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateWizardDisplay();
                this.updateStepContent();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateWizardDisplay();
            this.updateStepContent();
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.updateWizardDisplay();
            this.updateStepContent();
        }
    }

    updateWizardDisplay() {
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update wizard steps
        document.querySelectorAll('.wizard-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Scroll to top
        document.querySelector('.wizard-content').scrollIntoView({ behavior: 'smooth' });
    }

    updateStepContent() {
        switch (this.currentStep) {
            case 1:
                console.log('Updating step 1 content - displaying packages');
                // Force reload packages when entering step 1
                if (this.packages.length === 0) {
                    console.log('No packages found, using premium packages...');
                    // Packages already loaded in constructor
                } else {
                    this.displayPackages();
                }
                break;
            case 2:
                this.displayAddons();
                break;
            case 3:
                this.renderCalendar();
                this.updateTimeSlots();
                break;
            case 4:
                // Personal details form is already rendered
                break;
            case 5:
                this.updateReceipt();
                break;
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.selectedPackage) {
                    this.showError('Please select a package to continue.');
                    return false;
                }
                return true;
            case 2:
                // Add-ons are optional
                return true;
            case 3:
                if (!this.selectedDate || !this.selectedTime) {
                    this.showError('Please select both date and time to continue.');
                    return false;
                }
                return true;
            case 4:
                return this.validatePersonalDetails();
            case 5:
                return true;
            default:
                return true;
        }
    }

    // ================================
    // SERVICE & PACKAGE SELECTION
    // ================================

    selectService(service) {
        this.selectedService = service;
        
        // Update active tab
        document.querySelectorAll('.service-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-service="${service}"]`).classList.add('active');
        
        // Reset package selection
        this.selectedPackage = null;
        document.getElementById('step1Next').disabled = true;
        
        // Display packages for selected service
        this.displayPackages();
    }

    async loadPackages() {
        console.log('=== LOADING PACKAGES FROM DATABASE ===');
        try {
            this.showLoading('packagesLoading');
            
            if (this.supabase) {
                console.log('Fetching packages from Supabase...');
                const { data, error } = await this.supabase
                    .from('packages')
                    .select('*')
                    .order('price', { ascending: true });

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                if (data && data.length > 0) {
                    // Transform database data to premium format
                    this.packages = data.map(pkg => this.transformToPremiuPackage(pkg));
                    console.log('Loaded and transformed packages from database:', this.packages);
                    this.displayPackages();
                } else {
                    console.log('No packages found in database, using premium fallback');
                    this.loadPremiumPackages();
                }
            } else {
                console.log('Supabase not available, using premium fallback');
                this.loadPremiumPackages();
            }
            
        } catch (error) {
            console.error('Error loading packages from database:', error);
            console.log('Loading premium fallback packages due to error...');
            this.loadPremiumPackages();
        } finally {
            this.hideLoading('packagesLoading');
        }
    }

    getTierFromPrice(price) {
        if (price <= 999) return 'silver';
        if (price <= 1399) return 'gold';
        if (price <= 1899) return 'diamond';
        return 'platinum';
    }

    getBadgeFromTier(tier) {
        const badges = {
            'silver': 'Most Loved',
            'gold': 'Luxury',
            'diamond': 'Elite',
            'platinum': 'Elite'
        };
        return badges[tier] || 'Popular';
    }

    transformToPremiuPackage(pkg) {
        // Determine tier from price
        const tier = pkg.tier || this.getTierFromPrice(pkg.price);
        
        // Get premium name based on tier and service type
        const premiumName = this.getPremiumName(tier, pkg.service_type);
        
        // Get badge based on tier
        const badge = pkg.badge || this.getBadgeFromTier(tier);
        
        return {
            ...pkg,
            name: premiumName,
            tier: tier,
            badge: badge
        };
    }

    getPremiumName(tier, serviceType) {
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

    displayPackages() {
        console.log('=== DISPLAYING PACKAGES ===');
        const container = document.getElementById('packagesContainer');
        if (!container) {
            console.error('Packages container not found!');
            return;
        }

        console.log('Displaying packages for service:', this.selectedService);
        console.log('Available packages:', this.packages);

        const filteredPackages = this.packages.filter(pkg => 
            pkg.service_type === this.selectedService
        );

        console.log('Filtered packages:', filteredPackages);

        if (filteredPackages.length === 0) {
            container.innerHTML = `
                <div class="no-packages" style="text-align: center; padding: 40px; color: #b3b3b3;">
                    <p>No packages available for ${this.selectedService} celebrations yet.</p>
                    <p>Please contact us directly for custom arrangements.</p>
                </div>
            `;
            return;
        }

        // Display packages with premium card structure
        container.innerHTML = filteredPackages.map(pkg => `
            <div class="premium-card ${pkg.tier || 'default'} ${this.selectedPackage?.id === pkg.id ? 'selected' : ''}" 
                 data-package-id="${pkg.id}" 
                 onclick="bookingWizard.selectPackage('${pkg.id}')">
                ${pkg.badge ? `<div class="premium-badge">${pkg.badge}</div>` : ''}
                <div class="package-type">${this.selectedService.charAt(0).toUpperCase() + this.selectedService.slice(1)} Celebration</div>
                <h3 class="premium-title">${pkg.name}</h3>
                <div class="price">₹ ${pkg.price.toLocaleString()}</div>
                <div class="divider"></div>
                <ul class="premium-features">
                    ${(pkg.features || []).map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="addon-note">${pkg.description || 'Personalized add-ons available'}</div>
                <button class="premium-btn" onclick="event.stopPropagation();">Reserve Experience</button>
            </div>
        `).join('');

        console.log('=== PACKAGES DISPLAYED SUCCESSFULLY ===');
    }

    selectPackage(packageId) {
        // Remove previous selection
        document.querySelectorAll('.premium-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked package
        const packageCard = document.querySelector(`[data-package-id="${packageId}"]`);
        if (packageCard) {
            packageCard.classList.add('selected');
        }

        // Store selected package
        this.selectedPackage = this.packages.find(pkg => pkg.id === packageId);
        
        // Reset time selection when package changes
        this.selectedTime = null;
        
        // Update time slots if we're on step 3 and have a selected date
        if (this.currentStep === 3 && this.selectedDate) {
            this.updateTimeSlots();
            this.updateNextButton();
        }
        
        // Enable next button
        document.getElementById('step1Next').disabled = false;
    }

    // ================================
    // ADD-ONS SELECTION
    // ================================

    async loadAddons() {
        console.log('=== LOADING ADD-ONS FROM DATABASE ===');
        try {
            this.showLoading('addonsLoading');
            
            if (this.supabase) {
                console.log('Fetching add-ons from Supabase...');
                const { data, error } = await this.supabase
                    .from('addons')
                    .select('*')
                    .order('price', { ascending: true });

                if (error) {
                    console.error('Supabase add-ons error:', error);
                    throw error;
                }

                if (data && data.length > 0) {
                    this.addons = data;
                    console.log('Loaded add-ons from database:', this.addons);
                } else {
                    console.log('No add-ons found in database, using fallback');
                    this.loadFallbackAddons();
                }
            } else {
                console.log('Supabase not available, using fallback add-ons');
                this.loadFallbackAddons();
            }
            
        } catch (error) {
            console.error('Error loading add-ons from database:', error);
            console.log('Loading fallback add-ons due to error...');
            this.loadFallbackAddons();
        } finally {
            this.hideLoading('addonsLoading');
        }
    }

    loadFallbackAddons() {
        console.log('Loading fallback add-ons...');
        this.addons = [
            {
                id: 'addon_photos',
                name: 'Personal Photos & Videos on Screen',
                description: 'तुमचे वैयक्तिक फोटो आणि व्हिडिओ स्क्रीनवर मेमरीज स्लाइडशोच्या स्वरूपात दाखवले जातील',
                price: 150
            },
            {
                id: 'addon_photoshoot',
                name: 'Full Photoshoot + 1 Free Instagram Reel',
                description: 'पूर्ण फोटोशूट केले जाईल आणि त्यासोबत 1 मोफत इंस्टाग्राम रील तयार केली जाईल',
                price: 400
            },
            {
                id: 'addon_bouquet',
                name: 'Flower Bouquet (for photoshoot)',
                description: 'फोटोशूटसाठी एक सुंदर फुलांचा बुके दिला जाईल',
                price: 100
            }
        ];
        console.log('Fallback add-ons loaded:', this.addons);
    }

    displayAddons() {
        const container = document.getElementById('addonsContainer');
        if (!container) return;

        if (this.addons.length === 0) {
            container.innerHTML = `
                <div class="no-addons">
                    <p>No add-ons available at the moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.addons.map(addon => `
            <div class="addon-card ${this.selectedAddons.includes(addon.id) ? 'selected' : ''}" 
                 data-addon-id="${addon.id}" 
                 onclick="bookingWizard.toggleAddon('${addon.id}')">
                <div class="addon-checkbox"></div>
                <div class="addon-info">
                    <h4 class="addon-title">${addon.name}</h4>
                    <p class="addon-description">${addon.description}</p>
                    <div class="addon-price">₹${addon.price}</div>
                </div>
            </div>
        `).join('');
    }

    toggleAddon(addonId) {
        const addonCard = document.querySelector(`[data-addon-id="${addonId}"]`);
        if (!addonCard) return;

        const isSelected = addonCard.classList.contains('selected');
        
        if (isSelected) {
            addonCard.classList.remove('selected');
            this.selectedAddons = this.selectedAddons.filter(id => id !== addonId);
        } else {
            addonCard.classList.add('selected');
            this.selectedAddons.push(addonId);
        }
    }

    // ================================
    // DATE & TIME SELECTION
    // ================================

    async loadBookedSlots() {
        try {
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('bookings')
                    .select('event_date, event_time')
                    .eq('booking_status', 'confirmed');

                if (error) throw error;

                // Group bookings by date
                this.bookedSlots = {};
                data?.forEach(booking => {
                    const date = booking.event_date;
                    if (!this.bookedSlots[date]) {
                        this.bookedSlots[date] = [];
                    }
                    this.bookedSlots[date].push(booking.event_time);
                });
            }
        } catch (error) {
            console.error('Error loading booked slots:', error);
        }
    }

    changeMonth(direction) {
        this.currentCalendarMonth += direction;
        
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        } else if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        
        this.renderCalendar();
    }

    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Update month/year display
        const monthYearEl = document.getElementById('calendarMonthYear');
        if (monthYearEl) {
            monthYearEl.textContent = `${monthNames[this.currentCalendarMonth]} ${this.currentCalendarYear}`;
        }

        // Generate calendar days
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;

        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for proper comparison
        
        let html = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day other-month"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentCalendarYear, this.currentCalendarMonth, day);
            // Fix timezone issue by formatting date properly
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayStr}`;
            
            let classes = ['calendar-day'];
            
            // Check if it's today
            if (date.getTime() === today.getTime()) {
                classes.push('today');
            }
            
            // Check if it's selected
            if (this.selectedDate === dateStr) {
                classes.push('selected');
            }
            
            // Check if it's in the past
            if (date.getTime() < today.getTime()) {
                classes.push('unavailable');
            }
            
            html += `<div class="${classes.join(' ')}" data-date="${dateStr}" onclick="bookingWizard.selectDate('${dateStr}')">${day}</div>`;
        }
        
        calendarDays.innerHTML = html;
    }

    selectDate(dateStr) {
        const dateEl = document.querySelector(`[data-date="${dateStr}"]`);
        if (!dateEl || dateEl.classList.contains('unavailable')) {
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection
        dateEl.classList.add('selected');
        this.selectedDate = dateStr;

        // Reset time selection
        this.selectedTime = null;

        // Update time slots
        this.updateTimeSlots();
        this.updateSelectedDateInfo();
        this.updateNextButton();
    }

    updateSelectedDateInfo() {
        const infoEl = document.getElementById('selectedDateInfo');
        if (!infoEl) return;

        if (this.selectedDate) {
            // Fix timezone issue by creating date properly
            const [year, month, day] = this.selectedDate.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month is 0-indexed
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            infoEl.innerHTML = `<p><strong>Selected Date:</strong> ${date.toLocaleDateString('en-US', options)}</p>`;
        } else {
            infoEl.innerHTML = '<p>Please select a date first</p>';
        }
    }

    updateTimeSlots() {
        const container = document.getElementById('timeslotsContainer');
        if (!container || !this.selectedDate || !this.selectedPackage) {
            if (container) container.innerHTML = '<p class="no-slots">Please select a package and date first</p>';
            return;
        }

        // Get time slots based on package type and duration
        const timeSlots = this.getTimeSlotsForPackage(this.selectedPackage);
        const bookedForDate = this.bookedSlots[this.selectedDate] || [];

        container.innerHTML = timeSlots.map(slot => {
            const isBooked = bookedForDate.includes(slot);
            const isSelected = this.selectedTime === slot;
            
            let classes = ['timeslot'];
            if (isBooked) classes.push('unavailable');
            if (isSelected) classes.push('selected');

            return `
                <div class="${classes.join(' ')}" 
                     data-time="${slot}" 
                     onclick="bookingWizard.selectTime('${slot}')">
                    ${this.formatTimeSlot(slot)}
                    ${isBooked ? '<br><small>Booked</small>' : ''}
                </div>
            `;
        }).join('');
    }

    getTimeSlotsForPackage(pkg) {
        if (!pkg) return [];

        // Extract duration from package
        const duration = pkg.duration.toLowerCase();
        
        // Different time slots based on package duration and type
        if (duration.includes('3 hour') || duration.includes('3-hour')) {
            // For 3-hour packages (like Premium Theatre)
            return [
                '10:00-13:00', '11:00-14:00', '12:00-15:00', 
                '14:00-17:00', '15:00-18:00', '16:00-19:00', '17:00-20:00'
            ];
        } else if (duration.includes('2 hour') || duration.includes('90 minutes')) {
            // For 2-hour or 90-minute packages
            return [
                '10:00-12:00', '11:00-13:00', '12:00-14:00', '13:00-15:00',
                '14:00-16:00', '15:00-17:00', '16:00-18:00', '17:00-19:00', '18:00-20:00'
            ];
        } else {
            // For 1-hour packages (default)
            return [
                '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00',
                '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
                '18:00-19:00', '19:00-20:00'
            ];
        }
    }

    formatTimeSlot(slot) {
        // Convert 24-hour format to 12-hour format for display
        const [startTime, endTime] = slot.split('-');
        
        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}:${minutes} ${ampm}`;
        };

        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }

    selectTime(timeSlot) {
        const timeEl = document.querySelector(`[data-time="${timeSlot}"]`);
        if (!timeEl || timeEl.classList.contains('unavailable')) {
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.timeslot').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection
        timeEl.classList.add('selected');
        this.selectedTime = timeSlot;

        this.updateNextButton();
    }

    updateNextButton() {
        const nextBtn = document.getElementById('step3Next');
        if (nextBtn) {
            nextBtn.disabled = !(this.selectedDate && this.selectedTime);
        }
    }

    // ================================
    // PERSONAL DETAILS
    // ================================

    validatePersonalDetails() {
        const form = document.getElementById('personalDetailsForm');
        if (!form) return false;

        const requiredFields = ['customerName', 'customerPhone', 'agreePolicy'];
        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field) return;

            const value = field.type === 'checkbox' ? field.checked : field.value.trim();
            
            if (!value) {
                field.style.borderColor = '#ff6b6b';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });

        // Update personal details object
        if (isValid) {
            this.personalDetails = {
                name: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                email: document.getElementById('customerEmail').value.trim() || null,
                guestCount: parseInt(document.getElementById('guestCount').value) || 2,
                specialRequests: document.getElementById('specialRequests').value.trim() || null
            };
        }

        return isValid;
    }

    // ================================
    // RECEIPT & PAYMENT
    // ================================

    updateReceipt() {
        // Service type
        document.getElementById('receiptServiceType').textContent = 
            this.selectedService.charAt(0).toUpperCase() + this.selectedService.slice(1);

        // Package
        document.getElementById('receiptPackage').textContent = 
            this.selectedPackage ? this.selectedPackage.name : '-';

        // Date & Time
        if (this.selectedDate && this.selectedTime) {
            // Fix timezone issue in receipt display
            const [year, month, day] = this.selectedDate.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month is 0-indexed
            const dateStr = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = this.formatTimeSlot(this.selectedTime);
            document.getElementById('receiptDateTime').textContent = 
                `${dateStr}, ${formattedTime}`;
        } else {
            document.getElementById('receiptDateTime').textContent = '-';
        }

        // Guests
        document.getElementById('receiptGuests').textContent = 
            this.personalDetails.guestCount || 2;

        // Customer details
        document.getElementById('receiptCustomerName').textContent = 
            this.personalDetails.name || '-';
        document.getElementById('receiptCustomerPhone').textContent = 
            this.personalDetails.phone || '-';
        document.getElementById('receiptCustomerEmail').textContent = 
            this.personalDetails.email || 'Not provided';

        // Pricing
        const packagePrice = this.selectedPackage ? this.selectedPackage.price : 0;
        const selectedAddonObjects = this.addons.filter(addon => 
            this.selectedAddons.includes(addon.id)
        );
        const addonsPrice = selectedAddonObjects.reduce((sum, addon) => sum + addon.price, 0);
        const totalAmount = packagePrice + addonsPrice;
        const advanceAmount = Math.round(totalAmount * 0.2);
        const remainingAmount = totalAmount - advanceAmount;

        document.getElementById('receiptPackagePrice').textContent = `₹${packagePrice.toLocaleString()}`;
        
        if (addonsPrice > 0) {
            document.getElementById('receiptAddonsSection').style.display = 'flex';
            document.getElementById('receiptAddonsPrice').textContent = `₹${addonsPrice.toLocaleString()}`;
        } else {
            document.getElementById('receiptAddonsSection').style.display = 'none';
        }

        document.getElementById('receiptTotalAmount').textContent = `₹${totalAmount.toLocaleString()}`;
        document.getElementById('receiptAdvanceAmount').textContent = `₹${advanceAmount.toLocaleString()}`;
        document.getElementById('receiptRemainingAmount').textContent = `₹${remainingAmount.toLocaleString()}`;

        // Payment amount
        document.getElementById('paymentAdvanceAmount').textContent = `₹${advanceAmount.toLocaleString()}`;
    }

    // ================================
    // BOOKING SUBMISSION
    // ================================

    async submitBooking() {
        try {
            this.showLoadingOverlay();

            // Collect all booking data
            const bookingData = this.collectBookingData();
            
            // Submit to Supabase
            if (this.supabase) {
                const { data, error } = await this.supabase
                    .from('bookings')
                    .insert([bookingData])
                    .select();

                if (error) throw error;

                // Show success modal
                this.showSuccessModal(data[0]);
            } else {
                // Fallback: show success with generated reference
                this.showSuccessModal({ booking_reference: this.generateBookingReference() });
            }

        } catch (error) {
            console.error('Error submitting booking:', error);
            this.showError('Failed to submit booking. Please try again or contact us directly.');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    collectBookingData() {
        const selectedAddonObjects = this.addons.filter(addon => 
            this.selectedAddons.includes(addon.id)
        );
        const packagePrice = this.selectedPackage ? this.selectedPackage.price : 0;
        const addonsPrice = selectedAddonObjects.reduce((sum, addon) => sum + addon.price, 0);
        const totalAmount = packagePrice + addonsPrice;
        const advanceAmount = Math.round(totalAmount * 0.2);

        return {
            booking_reference: this.generateBookingReference(),
            
            // Customer details
            customer_name: this.personalDetails.name,
            customer_phone: this.personalDetails.phone,
            customer_email: this.personalDetails.email,
            
            // Event details
            event_date: this.selectedDate,
            event_time: this.selectedTime,
            guest_count: this.personalDetails.guestCount,
            special_requests: this.personalDetails.specialRequests,
            
            // Booking details
            service_type: this.selectedService,
            selected_package_id: this.selectedPackage.id,
            selected_package_name: this.selectedPackage.name,
            package_price: packagePrice,
            selected_addons: this.selectedAddons,
            addons_price: addonsPrice,
            total_amount: totalAmount,
            advance_amount: advanceAmount,
            
            // Status
            booking_status: 'pending',
            payment_status: 'pending',
            created_at: new Date().toISOString()
        };
    }

    generateBookingReference() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = date.getTime().toString().slice(-4);
        return `CP${dateStr}${timeStr}`;
    }

    // ================================
    // UTILITY METHODS
    // ================================

    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    showSuccessModal(bookingData) {
        const modal = document.getElementById('successModal');
        const referenceEl = document.getElementById('bookingReference');
        
        if (referenceEl && bookingData.booking_reference) {
            referenceEl.textContent = bookingData.booking_reference;
        }
        
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }

    showError(message) {
        alert(message); // You can enhance this with a custom modal
    }
}

// Initialize booking wizard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing booking wizard...');
    
    // Force clear any cached data
    if (window.bookingWizard) {
        delete window.bookingWizard;
    }
    
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        try {
            window.bookingWizard = new BookingWizard();
            console.log('BookingWizard initialized successfully');
        } catch (error) {
            console.error('Error creating BookingWizard:', error);
            // Try again with a longer delay
            setTimeout(() => {
                try {
                    window.bookingWizard = new BookingWizard();
                    console.log('BookingWizard initialized on retry');
                } catch (retryError) {
                    console.error('Retry failed:', retryError);
                    // Force load premium packages
                    const container = document.getElementById('packagesContainer');
                    if (container) {
                        console.log('Loading premium packages manually...');
                        container.innerHTML = `
                            <div class="premium-card silver">
                                <div class="premium-badge">Most Loved</div>
                                <div class="package-type">Birthday Celebration</div>
                                <h3 class="premium-title">Silver Spark</h3>
                                <div class="price">₹ 999</div>
                                <div class="divider"></div>
                                <ul class="premium-features">
                                    <li>Elegant balloon décor</li>
                                    <li>Soft ambient lighting</li>
                                    <li>Music setup</li>
                                    <li>Private space</li>
                                    <li>Personalized add-ons available</li>
                                </ul>
                                <div class="addon-note">Personalized add-ons available</div>
                                <button class="premium-btn">Reserve Experience</button>
                            </div>
                            <div class="premium-card gold">
                                <div class="premium-badge">Luxury</div>
                                <div class="package-type">Birthday Celebration</div>
                                <h3 class="premium-title">Golden Glow</h3>
                                <div class="price">₹ 1,399</div>
                                <div class="divider"></div>
                                <ul class="premium-features">
                                    <li>Premium themed décor</li>
                                    <li>Candlelight ambiance</li>
                                    <li>LED lighting</li>
                                    <li>Photography assistance</li>
                                    <li>Personalized add-ons available</li>
                                </ul>
                                <div class="addon-note">Personalized add-ons available</div>
                                <button class="premium-btn">Reserve Experience</button>
                            </div>
                            <div class="premium-card diamond">
                                <div class="premium-badge">Elite</div>
                                <div class="package-type">Birthday Celebration</div>
                                <h3 class="premium-title">Diamond</h3>
                                <div class="price">₹ 1,899</div>
                                <div class="divider"></div>
                                <ul class="premium-features">
                                    <li>Luxury décor theme</li>
                                    <li>Smoke & LED effects</li>
                                    <li>Customized name display</li>
                                    <li>Professional photos</li>
                                    <li>Premium add-ons included</li>
                                </ul>
                                <div class="addon-note">Personalized add-ons available</div>
                                <button class="premium-btn">Reserve Experience</button>
                            </div>
                            <div class="premium-card platinum">
                                <div class="premium-badge">Elite</div>
                                <div class="package-type">Birthday Celebration</div>
                                <h3 class="premium-title">Platinum</h3>
                                <div class="price">₹ 2,499</div>
                                <div class="divider"></div>
                                <ul class="premium-features">
                                    <li>Exclusive luxury theme</li>
                                    <li>Flower & candle décor</li>
                                    <li>Private celebration room</li>
                                    <li>Photos + reels</li>
                                    <li>All add-ons included</li>
                                </ul>
                                <div class="addon-note">Personalized add-ons available</div>
                                <button class="premium-btn">Reserve Experience</button>
                            </div>
                        `;
                    }
                }
            }, 2000);
        }
    }, 100);
});

// Also try immediate initialization if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded (from loading state), initializing booking wizard...');
        setTimeout(() => {
            if (!window.bookingWizard) {
                try {
                    window.bookingWizard = new BookingWizard();
                } catch (error) {
                    console.error('Error in delayed initialization:', error);
                }
            }
        }, 100);
    });
} else {
    console.log('DOM already loaded, initializing booking wizard immediately...');
    setTimeout(() => {
        try {
            if (!window.bookingWizard) {
                window.bookingWizard = new BookingWizard();
            }
        } catch (error) {
            console.error('Error in immediate initialization:', error);
        }
    }, 100);
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
});