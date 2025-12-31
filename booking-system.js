// Comprehensive Booking System with Calendar, Time Slots, and Payment
class VintageBookingSystem {
    constructor() {
        this.currentStep = 1;
        this.selectedPackage = null;
        this.selectedAddons = [];
        this.selectedDate = null;
        this.selectedTime = null;
        this.customerDetails = {};
        this.totalAmount = 0;
        this.advanceAmount = 0;
        this.workingDays = [];
        this.holidays = [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();

        this.init();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
    
    cleanup() {
        // Remove any payment modals or other elements created by the booking system
        const modals = document.querySelectorAll('#paymentModal, #successModal, .modal-overlay');
        modals.forEach(modal => modal.remove());
    }

    async init() {
        this.setupSupabase();
        this.setupEventListeners();
        await this.loadInitialData();
        this.generateYearOptions();

        // Fallback calendar generation after a delay
        setTimeout(() => {
            console.log('Fallback calendar generation');
            this.generateCalendar();
        }, 2000);
    }

    setupSupabase() {
        const SUPABASE_URL = window.SUPABASE_CONFIG?.url || 'YOUR_SUPABASE_URL';
        const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || 'YOUR_SUPABASE_ANON_KEY';

        if (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.warn('Supabase not configured');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextStepBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevStepBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('confirmPaymentBtn')?.addEventListener('click', () => this.processPayment());

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));

        // Add a test button to manually trigger calendar generation
        setTimeout(() => {
            const testBtn = document.createElement('button');
            testBtn.textContent = 'Test Calendar';
            testBtn.style.position = 'fixed';
            testBtn.style.top = '10px';
            testBtn.style.right = '10px';
            testBtn.style.zIndex = '9999';
            testBtn.onclick = () => {
                console.log('Manual calendar generation triggered');
                this.generateCalendar();
            };
            document.body.appendChild(testBtn);
        }, 1000);

        // Add-on category tabs
        document.querySelectorAll('.vintage-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.filterAddons(e.target.dataset.category));
        });

        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectPaymentMethod(e.currentTarget.dataset.method));
        });

        // Cart toggle
        document.getElementById('cartToggle')?.addEventListener('click', () => this.toggleCart());

        // Form validation
        document.getElementById('customerDetailsForm')?.addEventListener('input', () => this.validateCustomerForm());
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadPackages(),
                this.loadAddons(),
                this.loadWorkingDays(),
                this.loadHolidays()
            ]);

            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                this.generateCalendar();
                console.log('Calendar generation completed');
            }, 100);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showAlert('Error loading data. Please refresh the page.', 'error');
        }
    } as
    async loadPackages() {
        if (!this.supabase) {
            this.showMockPackages();
            return;
        }

        try {
            const { data: packages, error } = await this.supabase
                .from('public_packages')
                .select('*')
                .order('price');

            if (error) throw error;

            this.renderPackages(packages || []);
        } catch (error) {
            console.error('Error loading packages:', error);
            this.showMockPackages();
        }
    }

    showMockPackages() {
        const mockPackages = [
            { id: 1, name: 'Silver Package', duration: 1, price: 549, features: 'Balloon & Tent Decoration\nSeparate Decorated Hall\nSound System\nLED Name Display\nParty Crown' },
            { id: 2, name: 'Gold Package', duration: 2, price: 899, features: 'Premium Decoration\nPrivate Hall\nDJ Sound System\nLED Display\nPhoto Booth' },
            { id: 3, name: 'Platinum Package', duration: 3, price: 1299, features: 'Luxury Decoration\nVIP Hall\nProfessional DJ\nLED Wall Display\nPhotography' },
            { id: 4, name: 'Diamond Package', duration: 4, price: 1799, features: 'Premium Decoration\nExclusive Hall\nLive DJ & Music\nVideography\nCake & Catering' }
        ];
        this.renderPackages(mockPackages);
    }

    renderPackages(packages) {
        const container = document.getElementById('packagesShowcase');

        if (!packages || packages.length === 0) {
            container.innerHTML = '<p class="no-packages">No packages available at the moment.</p>';
            return;
        }

        container.innerHTML = packages.map(pkg => {
            const features = pkg.features ? pkg.features.split('\n').filter(f => f.trim()) : [];

            return `
                <div class="package-card" data-package-id="${pkg.id}">
                    <div class="package-header">
                        <h3 class="package-name">${pkg.name}</h3>
                        <span class="package-duration">${pkg.duration} Hour${pkg.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div class="package-price">₹${pkg.price.toLocaleString()}</div>
                    <ul class="package-features">
                        ${features.map(feature => `
                            <li><i class="fas fa-check"></i> ${feature.trim()}</li>
                        `).join('')}
                    </ul>
                    <button class="select-package-btn" data-package='${JSON.stringify(pkg)}'>
                        Select This Package
                    </button>
                </div>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.select-package-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const packageData = JSON.parse(e.target.dataset.package);
                this.selectPackage(packageData);
            });
        });
    }

    async loadAddons() {
        if (!this.supabase) {
            this.showMockAddons();
            return;
        }

        try {
            const { data: addons, error } = await this.supabase
                .from('public_addons')
                .select('*')
                .order('category', 'name');

            if (error) throw error;

            this.allAddons = addons || [];
            this.renderAddons(this.allAddons);
        } catch (error) {
            console.error('Error loading add-ons:', error);
            this.showMockAddons();
        }
    }

    showMockAddons() {
        const mockAddons = [
            { id: 1, name: 'Photo Booth', category: 'entertainment', price: 299, description: 'Instant photo prints with fun props and masks' },
            { id: 2, name: 'Live Music', category: 'entertainment', price: 599, description: 'Live band performance with professional singer' },
            { id: 3, name: 'Magic Show', category: 'entertainment', price: 799, description: 'Professional magician with interactive tricks' },
            { id: 4, name: 'LED Lighting', category: 'decoration', price: 399, description: 'Professional LED lighting setup' },
            { id: 5, name: 'Flower Decoration', category: 'decoration', price: 499, description: 'Beautiful flower arrangements' },
            { id: 6, name: 'Catering Plus', category: 'catering', price: 999, description: 'Premium cake, snacks, and beverages' }
        ];
        this.allAddons = mockAddons;
        this.renderAddons(mockAddons);
    }

    renderAddons(addons) {
        const container = document.getElementById('addonsShowcase');

        if (!addons || addons.length === 0) {
            container.innerHTML = '<p class="no-addons">No add-ons available.</p>';
            return;
        }

        container.innerHTML = addons.map(addon => `
            <div class="addon-card" data-addon-id="${addon.id}">
                <div class="addon-header">
                    <h4 class="addon-name">${addon.name}</h4>
                    <span class="addon-category">${addon.category}</span>
                </div>
                <div class="addon-price">₹${addon.price.toLocaleString()}</div>
                <div class="addon-description">${addon.description || 'No description available'}</div>
                <button class="addon-toggle-btn" data-addon='${JSON.stringify(addon)}'>
                    <i class="fas fa-plus"></i>
                    Add to Package
                </button>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.addon-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const addonData = JSON.parse(e.target.dataset.addon);
                this.toggleAddon(addonData, e.target);
            });
        });
    }

    async loadWorkingDays() {
        if (!this.supabase) {
            // Default working days (Monday to Saturday)
            this.workingDays = [
                { day_of_week: 1, is_working: true, start_time: '09:00', end_time: '18:00' },
                { day_of_week: 2, is_working: true, start_time: '09:00', end_time: '18:00' },
                { day_of_week: 3, is_working: true, start_time: '09:00', end_time: '18:00' },
                { day_of_week: 4, is_working: true, start_time: '09:00', end_time: '18:00' },
                { day_of_week: 5, is_working: true, start_time: '09:00', end_time: '18:00' },
                { day_of_week: 6, is_working: true, start_time: '09:00', end_time: '17:00' }
            ];
            return;
        }

        try {
            const { data: workingDays, error } = await this.supabase
                .from('working_days')
                .select('*')
                .order('day_of_week');

            if (error) throw error;
            this.workingDays = workingDays || [];
        } catch (error) {
            console.error('Error loading working days:', error);
        }
    }

    async loadHolidays() {
        if (!this.supabase) {
            this.holidays = [];
            return;
        }

        try {
            const { data: holidays, error } = await this.supabase
                .from('holidays')
                .select('*')
                .gte('date', new Date().toISOString().split('T')[0]);

            if (error) throw error;
            this.holidays = holidays || [];
        } catch (error) {
            console.error('Error loading holidays:', error);
        }
    }

    selectPackage(packageData) {
        // Remove previous selection
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to current package
        document.querySelector(`[data-package-id="${packageData.id}"]`).classList.add('selected');

        this.selectedPackage = packageData;
        this.updateCart();
        this.showAlert(`${packageData.name} selected!`, 'success');
    }

    toggleAddon(addonData, buttonElement) {
        const addonIndex = this.selectedAddons.findIndex(addon => addon.id === addonData.id);
        const card = buttonElement.closest('.addon-card');

        if (addonIndex > -1) {
            // Remove addon
            this.selectedAddons.splice(addonIndex, 1);
            buttonElement.innerHTML = '<i class="fas fa-plus"></i> Add to Package';
            card.classList.remove('selected');
            this.showAlert(`${addonData.name} removed`, 'info');
        } else {
            // Add addon
            this.selectedAddons.push(addonData);
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Added';
            card.classList.add('selected');
            this.showAlert(`${addonData.name} added!`, 'success');
        }

        this.updateCart();
    }

    filterAddons(category) {
        // Update active tab
        document.querySelectorAll('.vintage-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter addons
        const filteredAddons = category === 'all'
            ? this.allAddons
            : this.allAddons.filter(addon => addon.category === category);

        this.renderAddons(filteredAddons);
        this.updateAddonButtons();
    }

    updateAddonButtons() {
        document.querySelectorAll('.addon-toggle-btn').forEach(btn => {
            const addonData = JSON.parse(btn.dataset.addon);
            const isSelected = this.selectedAddons.some(addon => addon.id === addonData.id);
            const card = btn.closest('.addon-card');

            if (isSelected) {
                btn.innerHTML = '<i class="fas fa-check"></i> Added';
                card.classList.add('selected');
            } else {
                btn.innerHTML = '<i class="fas fa-plus"></i> Add to Package';
                card.classList.remove('selected');
            }
        });
    }

    updateCart() {
        const cart = document.getElementById('vintageCart');
        const cartItems = document.getElementById('cartItems');
        const cartBadge = document.getElementById('cartBadge');
        const cartTotalAmount = document.getElementById('cartTotalAmount');
        const cartAdvanceAmount = document.getElementById('cartAdvanceAmount');

        let items = [];
        let total = 0;

        // Add package to cart
        if (this.selectedPackage) {
            items.push({
                type: 'package',
                name: this.selectedPackage.name,
                price: this.selectedPackage.price
            });
            total += this.selectedPackage.price;
        }

        // Add addons to cart
        this.selectedAddons.forEach(addon => {
            items.push({
                type: 'addon',
                name: addon.name,
                price: addon.price
            });
            total += addon.price;
        });

        // Update cart display
        if (items.length > 0) {
            cart.style.display = 'block';
            cartItems.innerHTML = items.map(item => `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>₹${item.price.toLocaleString()}</span>
                </div>
            `).join('');
            cartBadge.textContent = items.length;
            cartTotalAmount.textContent = total.toLocaleString();
            cartAdvanceAmount.textContent = Math.round(total * 0.2).toLocaleString();
        } else {
            cart.style.display = 'none';
        }

        this.totalAmount = total;
        this.advanceAmount = Math.round(total * 0.2);
    }

    toggleCart() {
        const cartContent = document.getElementById('cartContent');
        cartContent.classList.toggle('expanded');
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const calendarTitle = document.getElementById('calendarTitle');

        console.log('Calendar elements:', { calendarGrid, calendarTitle });

        if (!calendarGrid || !calendarTitle) {
            console.error('Calendar elements not found!');
            return;
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        calendarTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Clear previous calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            const currentDate = new Date(this.currentYear, this.currentMonth, day);
            const dateString = currentDate.toISOString().split('T')[0];

            // Check if day is available
            const dayOfWeek = currentDate.getDay();
            const isWorkingDay = this.workingDays.some(wd => wd.day_of_week === dayOfWeek && wd.is_working);
            const isHoliday = this.holidays.some(h => h.date === dateString);
            const isPast = currentDate < today.setHours(0, 0, 0, 0);

            if (isPast || !isWorkingDay || isHoliday) {
                dayElement.classList.add('unavailable');
            } else {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }

            // Mark today
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            // Mark selected date
            if (this.selectedDate && currentDate.toDateString() === this.selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    changeMonth(direction) {
        this.currentMonth += direction;

        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }

        this.generateCalendar();
    }

    selectDate(date) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        // Add selection to clicked date
        event.target.classList.add('selected');

        this.selectedDate = date;
        this.generateTimeSlots();
        this.showAlert(`Date selected: ${date.toLocaleDateString()}`, 'success');
    }

    generateTimeSlots() {
        const container = document.getElementById('timeslotsContainer');
        if (!container || !this.selectedDate) return;

        const dayOfWeek = this.selectedDate.getDay();
        const workingDay = this.workingDays.find(wd => wd.day_of_week === dayOfWeek);

        if (!workingDay || !workingDay.is_working) {
            container.innerHTML = '<p class="no-slots">No time slots available for this day.</p>';
            return;
        }

        // Generate time slots based on package duration
        const packageDuration = this.selectedPackage ? this.selectedPackage.duration : 2;
        const startTime = this.parseTime(workingDay.start_time);
        const endTime = this.parseTime(workingDay.end_time);

        const slots = [];
        let currentTime = startTime;

        while (currentTime + (packageDuration * 60) <= endTime) {
            const slotStart = this.formatTime(currentTime);
            const slotEnd = this.formatTime(currentTime + (packageDuration * 60));

            slots.push({
                start: slotStart,
                end: slotEnd,
                minutes: currentTime
            });

            currentTime += 60; // 1-hour intervals
        }

        container.innerHTML = slots.map(slot => `
            <div class="timeslot available" data-time="${slot.start}">
                ${slot.start} - ${slot.end}
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.timeslot.available').forEach(slot => {
            slot.addEventListener('click', (e) => this.selectTimeSlot(e.target));
        });
    }

    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    selectTimeSlot(slotElement) {
        // Remove previous selection
        document.querySelectorAll('.timeslot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked slot
        slotElement.classList.add('selected');

        this.selectedTime = slotElement.dataset.time;
        this.showAlert(`Time slot selected: ${slotElement.textContent}`, 'success');
    }

    nextStep() {
        if (!this.validateCurrentStep()) return;

        if (this.currentStep < 5) {
            this.currentStep++;
            this.updateStepDisplay();

            if (this.currentStep === 3) {
                // Generate calendar when step 3 becomes active
                setTimeout(() => {
                    console.log('Step 3 activated, generating calendar');
                    this.generateCalendar();
                }, 200);
            } else if (this.currentStep === 5) {
                this.generateFinalSummary();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.selectedPackage) {
                    this.showAlert('Please select a package to continue', 'warning');
                    return false;
                }
                break;
            case 2:
                // Add-ons are optional, so always valid
                break;
            case 3:
                if (!this.selectedDate || !this.selectedTime) {
                    this.showAlert('Please select both date and time', 'warning');
                    return false;
                }
                break;
            case 4:
                if (!this.validateCustomerForm()) {
                    this.showAlert('Please fill in all required fields', 'warning');
                    return false;
                }
                this.collectCustomerDetails();
                break;
        }
        return true;
    }

    validateCustomerForm() {
        const form = document.getElementById('customerDetailsForm');
        if (!form) return false;

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        return isValid;
    }

    collectCustomerDetails() {
        this.customerDetails = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            guestCount: document.getElementById('guestCount').value,
            venueAddress: document.getElementById('venueAddress').value,
            specialRequests: document.getElementById('specialRequests').value
        };
    }

    updateStepDisplay() {
        console.log('Updating step display to step:', this.currentStep);

        // Update step indicators
        document.querySelectorAll('.step-item').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Show/hide step content
        document.querySelectorAll('.booking-step').forEach((step, index) => {
            const isActive = index + 1 === this.currentStep;
            step.classList.toggle('active', isActive);
            console.log(`Step ${index + 1} active:`, isActive);
        });

        // If we're on step 3, ensure calendar is generated
        if (this.currentStep === 3) {
            setTimeout(() => {
                console.log('Step 3 active, generating calendar');
                this.generateCalendar();
            }, 100);
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const confirmBtn = document.getElementById('confirmPaymentBtn');

        prevBtn.style.display = this.currentStep > 1 ? 'flex' : 'none';

        if (this.currentStep === 5) {
            nextBtn.style.display = 'none';
            confirmBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            confirmBtn.style.display = 'none';
        }
    }

    generateFinalSummary() {
        const summaryContainer = document.getElementById('finalSummary');
        const totalAmountEl = document.getElementById('totalAmount');
        const advanceAmountEl = document.getElementById('advanceAmount');
        const remainingAmountEl = document.getElementById('remainingAmount');

        let summaryHTML = '';

        // Package summary
        if (this.selectedPackage) {
            summaryHTML += `
                <div class="summary-item">
                    <h4>${this.selectedPackage.name}</h4>
                    <p>Duration: ${this.selectedPackage.duration} hour${this.selectedPackage.duration > 1 ? 's' : ''}</p>
                    <p>Price: ₹${this.selectedPackage.price.toLocaleString()}</p>
                </div>
            `;
        }

        // Add-ons summary
        if (this.selectedAddons.length > 0) {
            summaryHTML += `
                <div class="summary-item">
                    <h4>Selected Add-ons</h4>
                    ${this.selectedAddons.map(addon => `
                        <p>${addon.name} - ₹${addon.price.toLocaleString()}</p>
                    `).join('')}
                </div>
            `;
        }

        // Event details summary
        summaryHTML += `
            <div class="summary-item">
                <h4>Event Details</h4>
                <p><strong>Date:</strong> ${this.selectedDate.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${this.selectedTime}</p>
                <p><strong>Venue:</strong> ${this.customerDetails.venueAddress}</p>
                ${this.customerDetails.guestCount ? `<p><strong>Guests:</strong> ${this.customerDetails.guestCount}</p>` : ''}
            </div>
        `;

        // Customer details summary
        summaryHTML += `
            <div class="summary-item">
                <h4>Contact Information</h4>
                <p><strong>Name:</strong> ${this.customerDetails.name}</p>
                <p><strong>Email:</strong> ${this.customerDetails.email}</p>
                <p><strong>Phone:</strong> ${this.customerDetails.phone}</p>
            </div>
        `;

        summaryContainer.innerHTML = summaryHTML;

        // Update amounts
        const remainingAmount = this.totalAmount - this.advanceAmount;
        totalAmountEl.textContent = `₹${this.totalAmount.toLocaleString()}`;
        advanceAmountEl.textContent = `₹${this.advanceAmount.toLocaleString()}`;
        remainingAmountEl.textContent = `₹${remainingAmount.toLocaleString()}`;
    }

    selectPaymentMethod(method) {
        // Update active payment option
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-method="${method}"]`).classList.add('active');

        // Show corresponding payment form
        document.querySelectorAll('.payment-form > div').forEach(form => {
            form.classList.remove('active');
        });
        document.querySelector(`.${method}-payment`).classList.add('active');
    }

    generateYearOptions() {
        const yearSelect = document.getElementById('cardYear');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year <= currentYear + 10; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    async processPayment() {
        const confirmBtn = document.getElementById('confirmPaymentBtn');

        // Show loading state
        confirmBtn.innerHTML = '<div class="vintage-spinner"></div> Processing...';
        confirmBtn.disabled = true;

        try {
            // Show fake payment interface
            await this.showPaymentInterface();

        } catch (error) {
            console.error('Payment error:', error);
            this.showAlert('Payment failed. Please try again.', 'error');

            // Reset button
            confirmBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Payment';
            confirmBtn.disabled = false;
        }
    }

    async showPaymentInterface() {
        // Remove any existing payment modals first
        const existingModal = document.getElementById('paymentModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create payment modal
        const paymentModal = document.createElement('div');
        paymentModal.className = 'modal-overlay active';
        paymentModal.id = 'paymentModal';

        paymentModal.innerHTML = `
            <div class="vintage-modal payment-modal">
                <div class="modal-header">
                    <div class="payment-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <h3 class="modal-title">Secure Payment</h3>
                </div>
                <div class="modal-body">
                    <div class="payment-amount">
                        <h4>Amount to Pay: ₹${this.advanceAmount.toLocaleString()}</h4>
                        <p>Advance Payment (20% of total ₹${this.totalAmount.toLocaleString()})</p>
                    </div>
                    <div class="fake-payment-form">
                        <div class="payment-step" id="paymentStep1">
                            <h5>Processing Payment...</h5>
                            <div class="payment-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progressFill"></div>
                                </div>
                                <div class="progress-text" id="progressText">Connecting to payment gateway...</div>
                            </div>
                        </div>
                        <div class="payment-step" id="paymentStep2" style="display: none;">
                            <h5>Payment Successful!</h5>
                            <div class="success-animation">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <p>Your payment of ₹${this.advanceAmount.toLocaleString()} has been processed successfully.</p>
                            <div class="payment-details">
                                <div class="detail-row">
                                    <span>Transaction ID:</span>
                                    <span id="transactionId">TXN${Date.now()}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Payment Method:</span>
                                    <span>UPI Payment</span>
                                </div>
                                <div class="detail-row">
                                    <span>Status:</span>
                                    <span class="status-success">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="vintage-btn primary" id="completePaymentBtn" style="display: none;">
                        <i class="fas fa-check"></i>
                        Complete Booking
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(paymentModal);

        // Simulate payment progress
        await this.simulatePaymentProgress();
    }

    async simulatePaymentProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const step1 = document.getElementById('paymentStep1');
        const step2 = document.getElementById('paymentStep2');
        const completeBtn = document.getElementById('completePaymentBtn');

        const steps = [
            { text: 'Connecting to payment gateway...', progress: 20 },
            { text: 'Verifying payment details...', progress: 40 },
            { text: 'Processing payment...', progress: 60 },
            { text: 'Confirming transaction...', progress: 80 },
            { text: 'Payment completed!', progress: 100 }
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            progressText.textContent = steps[i].text;
            progressFill.style.width = steps[i].progress + '%';
        }

        // Show success step
        await new Promise(resolve => setTimeout(resolve, 500));
        step1.style.display = 'none';
        step2.style.display = 'block';
        completeBtn.style.display = 'flex';

        // Add event listener for complete button
        completeBtn.addEventListener('click', async () => {
            await this.completeBooking();
        });
    }

    async completeBooking() {
        try {
            // Create order in database
            await this.createOrder();

            // Close payment modal
            document.getElementById('paymentModal').remove();

            // Show success modal with receipt option
            this.showSuccessModal();

        } catch (error) {
            console.error('Booking completion error:', error);
            this.showAlert('Error completing booking. Please contact support.', 'error');
        }
    }

    async createOrder() {
        if (!this.supabase) {
            // Mock order creation
            this.orderId = Math.floor(Math.random() * 10000);
            return;
        }

        const orderData = {
            customer_name: this.customerDetails.name,
            customer_email: this.customerDetails.email,
            customer_phone: this.customerDetails.phone,
            customer_address: this.customerDetails.venueAddress,
            package_id: this.selectedPackage.id,
            package_name: this.selectedPackage.name,
            event_date: this.selectedDate.toISOString().split('T')[0],
            event_time: this.selectedTime,
            venue_address: this.customerDetails.venueAddress,
            total_amount: this.totalAmount,
            advance_amount: this.advanceAmount,
            status: 'confirmed',
            special_requests: this.customerDetails.specialRequests || null
        };

        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (orderError) throw orderError;

        this.orderId = order.id;

        // Insert order add-ons if any
        if (this.selectedAddons.length > 0) {
            const orderAddons = this.selectedAddons.map(addon => ({
                order_id: order.id,
                addon_id: addon.id,
                addon_name: addon.name,
                addon_price: addon.price,
                quantity: 1
            }));

            const { error: addonsError } = await this.supabase
                .from('order_addons')
                .insert(orderAddons);

            if (addonsError) throw addonsError;
        }
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        const bookingIdEl = document.getElementById('bookingId');

        bookingIdEl.textContent = `#CB${this.orderId.toString().padStart(4, '0')}`;

        // Add receipt download button
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="vintage-btn secondary" onclick="bookingSystem.downloadReceipt()">
                <i class="fas fa-download"></i>
                Download Receipt
            </button>
            <button class="vintage-btn primary" onclick="goToHome()">
                <i class="fas fa-home"></i>
                Back to Home
            </button>
        `;

        modal.classList.add('active');
    }

    downloadReceipt() {
        const receiptData = this.generateReceiptData();
        const receiptHTML = this.generateReceiptHTML(receiptData);

        // Create a new window for the receipt
        const receiptWindow = window.open('', '_blank', 'width=800,height=600');
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();

        // Auto-print after a short delay
        setTimeout(() => {
            receiptWindow.print();
        }, 1000);

        this.showAlert('Receipt generated! Check the new window.', 'success');
    }

    generateReceiptData() {
        const now = new Date();
        return {
            bookingId: `CB${this.orderId.toString().padStart(4, '0')}`,
            transactionId: `TXN${Date.now()}`,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            customer: this.customerDetails,
            package: this.selectedPackage,
            addons: this.selectedAddons,
            eventDate: this.selectedDate.toLocaleDateString(),
            eventTime: this.selectedTime,
            totalAmount: this.totalAmount,
            advanceAmount: this.advanceAmount,
            remainingAmount: this.totalAmount - this.advanceAmount
        };
    }

    generateReceiptHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Booking Receipt - ${data.bookingId}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .receipt {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #8B4513;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 2.5rem;
                    color: #8B4513;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .company-info {
                    color: #666;
                    font-size: 1.1rem;
                }
                .receipt-title {
                    font-size: 2rem;
                    color: #8B4513;
                    text-align: center;
                    margin: 30px 0;
                    font-weight: bold;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .info-section h3 {
                    color: #8B4513;
                    border-bottom: 2px solid #DEB887;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    padding: 5px 0;
                }
                .info-row.highlight {
                    background: #f9f9f9;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                }
                .label {
                    font-weight: 600;
                    color: #333;
                }
                .value {
                    color: #666;
                }
                .amount {
                    color: #8B4513;
                    font-weight: bold;
                }
                .items-section {
                    margin: 30px 0;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                .items-table th,
                .items-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                .items-table th {
                    background: #8B4513;
                    color: white;
                    font-weight: bold;
                }
                .total-section {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 30px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 1.1rem;
                }
                .total-row.final {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #8B4513;
                    border-top: 2px solid #8B4513;
                    padding-top: 15px;
                    margin-top: 15px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #DEB887;
                    color: #666;
                }
                .status-paid {
                    background: #27ae60;
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: bold;
                }
                @media print {
                    body { background: white; }
                    .receipt { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="logo">🎉 Celebration Point</div>
                    <div class="company-info">
                        Premium Event Management Services<br>
                        Creating Unforgettable Memories
                    </div>
                </div>

                <div class="receipt-title">BOOKING RECEIPT</div>

                <div class="info-grid">
                    <div class="info-section">
                        <h3>Booking Information</h3>
                        <div class="info-row">
                            <span class="label">Booking ID:</span>
                            <span class="value">${data.bookingId}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Transaction ID:</span>
                            <span class="value">${data.transactionId}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Booking Date:</span>
                            <span class="value">${data.date} ${data.time}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Status:</span>
                            <span class="status-paid">CONFIRMED</span>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3>Customer Details</h3>
                        <div class="info-row">
                            <span class="label">Name:</span>
                            <span class="value">${data.customer.name}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Email:</span>
                            <span class="value">${data.customer.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Phone:</span>
                            <span class="value">${data.customer.phone}</span>
                        </div>
                        ${data.customer.guestCount ? `
                        <div class="info-row">
                            <span class="label">Guests:</span>
                            <span class="value">${data.customer.guestCount}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <h3>Event Details</h3>
                    <div class="info-row highlight">
                        <span class="label">Event Date:</span>
                        <span class="value">${data.eventDate}</span>
                    </div>
                    <div class="info-row highlight">
                        <span class="label">Event Time:</span>
                        <span class="value">${data.eventTime}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Venue:</span>
                        <span class="value">${data.customer.venueAddress}</span>
                    </div>
                </div>

                <div class="items-section">
                    <h3>Package & Services</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Duration</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${data.package.name}</td>
                                <td>${data.package.duration} Hour${data.package.duration > 1 ? 's' : ''}</td>
                                <td class="amount">₹${data.package.price.toLocaleString()}</td>
                            </tr>
                            ${data.addons.map(addon => `
                                <tr>
                                    <td>${addon.name}</td>
                                    <td>Add-on Service</td>
                                    <td class="amount">₹${addon.price.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span class="amount">₹${data.totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>Advance Paid (20%):</span>
                        <span class="amount">₹${data.advanceAmount.toLocaleString()}</span>
                    </div>
                    <div class="total-row">
                        <span>Remaining Amount:</span>
                        <span class="amount">₹${data.remainingAmount.toLocaleString()}</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Amount:</span>
                        <span>₹${data.totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Thank you for choosing Celebration Point!</strong></p>
                    <p>We will contact you within 24 hours to confirm all details.</p>
                    <p>The remaining amount of ₹${data.remainingAmount.toLocaleString()} is due on the event day.</p>
                    <br>
                    <p>For any queries, please contact us at: <strong>support@celebrationpoint.com</strong></p>
                    <p>This is a computer-generated receipt and does not require a signature.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    showAlert(message, type = 'info', duration = 5000) {
        const container = document.getElementById('alertContainer');
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        alert.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(alert);

        // Auto remove after duration
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, duration);
    }
}

// Global functions
function goToHome() {
    window.location.href = 'index.html';
}

// Global functions
function goToHome() {
    window.location.href = 'index.html';
}

// Initialize booking system
let bookingSystem;
document.addEventListener('DOMContentLoaded', () => {
    bookingSystem = new VintageBookingSystem();
    
    // Make it globally accessible
    window.bookingSystem = bookingSystem;
    
    // Add debug info
    const debugDiv = document.createElement('div');
    debugDiv.className = 'booking-system-ref';
    debugDiv.textContent = 'Booking System Loaded';
    document.body.appendChild(debugDiv);
    
    setTimeout(() => {
        debugDiv.remove();
    }, 3000);
});