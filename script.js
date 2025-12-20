// Debug function to check hamburger
function checkHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    alert('Hamburger element: ' + (hamburger ? 'FOUND' : 'NOT FOUND') + 
          '\nNav menu: ' + (navMenu ? 'FOUND' : 'NOT FOUND') +
          '\nHamburger visible: ' + (hamburger ? getComputedStyle(hamburger).display : 'N/A') +
          '\nHamburger clickable: ' + (hamburger ? getComputedStyle(hamburger).pointerEvents : 'N/A'));
}

// Simple Mobile Menu Toggle - Working Solution
function toggleMobileMenu() {
    alert('Toggle function called!');
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Elements found:', hamburger, navMenu);
    
    if (hamburger && navMenu) {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Debug logging
        console.log('Menu toggled - Active:', navMenu.classList.contains('active'));
        alert('Menu toggled to: ' + (navMenu.classList.contains('active') ? 'OPEN' : 'CLOSED'));
    } else {
        alert('Elements not found! Hamburger: ' + !!hamburger + ', NavMenu: ' + !!navMenu);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Elements found:', {
        hamburger: !!hamburger,
        navMenu: !!navMenu
    });
    
    if (hamburger) {
        // Add click event to hamburger
        hamburger.addEventListener('click', toggleMobileMenu);
        
        // Also try with touchstart for mobile
        hamburger.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
    }
    
    // Close menu when clicking nav links
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation highlighting
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('href') === `#${current}`) {
            button.classList.add('active');
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});
// Package and Add-on booking functionality
document.addEventListener('DOMContentLoaded', function() {
    const bookButtons = document.querySelectorAll('.book-button-img');
    
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageCard = this.closest('.package-card');
            const addonCard = this.closest('.addon-card');
            
            let itemTitle, itemPrice, actionText;
            
            if (packageCard) {
                itemTitle = packageCard.querySelector('.chalk-title').textContent;
                itemPrice = packageCard.querySelector('.chalk-price').textContent;
                actionText = 'Selected';
                
                // Pre-select this package in the booking system if it exists
                if (window.bookingSystem) {
                    const packageData = {
                        id: packageCard.dataset.package,
                        name: itemTitle,
                        price: parseInt(itemPrice.replace('₹', '').replace(',', '')),
                        duration: packageCard.querySelector('.chalk-duration span:last-child').textContent.split(' ')[0]
                    };
                    window.bookingSystem.selectedPackage = packageData;
                }
            } else if (addonCard) {
                itemTitle = addonCard.querySelector('.chalk-title').textContent;
                itemPrice = addonCard.querySelector('.chalk-price').textContent;
                actionText = 'Selected';
            }
            
            // Add a booking animation
            this.style.transform = 'scale(0.9) rotate(10deg)';
            this.style.filter = 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3)) brightness(0.8)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0deg)';
                this.style.filter = 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3)) brightness(1)';
                
                // Show success message
                if (window.customerAlert) {
                    window.customerAlert.show(`${itemTitle} ${actionText.toLowerCase()}! Redirecting to booking...`, 'success');
                }
                
                // Redirect to booking page
                window.location.href = 'booking.html';
            }, 300);
        });
    });
    
    // Add hover effects to package cards
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
});

// Gallery functionality
let currentImageIndex = 0;
const totalImages = 7;

function updateGalleryDisplay() {
    const frames = document.querySelectorAll('.hanging-photo-frame');
    
    frames.forEach((frame, index) => {
        frame.classList.remove('active');
        frame.style.opacity = '0';
        frame.style.left = '200%';
    });
    
    // Show 3 images at a time
    for (let i = 0; i < 3; i++) {
        const frameIndex = (currentImageIndex + i) % totalImages;
        const frame = frames[frameIndex];
        
        if (frame) {
            frame.classList.add('active');
            frame.style.opacity = '1';
            frame.style.left = `${5 + (i * 30)}%`;
        }
    }
}

// Gallery navigation
document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
            updateGalleryDisplay();
        });
        
        nextBtn.addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % totalImages;
            updateGalleryDisplay();
        });
        
        // Initialize gallery
        updateGalleryDisplay();
        
        // Auto-rotate gallery every 5 seconds
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % totalImages;
            updateGalleryDisplay();
        }, 5000);
    }
});/
/ Mobile-specific enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Add mobile class to body
        document.body.classList.add('mobile-device');
        
        // Optimize touch scrolling for horizontal containers
        const horizontalContainers = document.querySelectorAll('.packages-container, .addons-container');
        horizontalContainers.forEach(container => {
            container.style.webkitOverflowScrolling = 'touch';
            container.style.scrollBehavior = 'smooth';
        });
        
        // Add touch feedback for interactive elements
        const touchElements = document.querySelectorAll('.nav-button, .book-now-btn, .gallery-btn, .package-card, .addon-card');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
        
        // Prevent zoom on double tap for specific elements
        const preventZoomElements = document.querySelectorAll('.nav-button, .book-now-btn');
        preventZoomElements.forEach(element => {
            element.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.click();
            });
        });
        
        // Optimize background attachment for mobile
        const backgroundSections = document.querySelectorAll('#home, #events, #packages, #addons, #book');
        backgroundSections.forEach(section => {
            section.style.backgroundAttachment = 'scroll';
        });
        
        // Force mobile homepage background
        const homeSection = document.querySelector('#home');
        if (homeSection) {
            homeSection.style.backgroundImage = 'url("assets/mobilehomepage.png")';
            homeSection.style.backgroundSize = 'cover';
            homeSection.style.backgroundPosition = 'center top';
            homeSection.style.backgroundRepeat = 'no-repeat';
            homeSection.style.backgroundAttachment = 'scroll';
        }
        
        // Add swipe indicators for horizontal scroll containers
        function addSwipeIndicator(container) {
            if (container.scrollWidth > container.clientWidth) {
                const indicator = document.createElement('div');
                indicator.className = 'swipe-indicator';
                indicator.innerHTML = '← Swipe to explore →';
                indicator.style.cssText = `
                    position: absolute;
                    bottom: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    font-style: italic;
                    pointer-events: none;
                    z-index: 10;
                `;
                container.parentElement.style.position = 'relative';
                container.parentElement.appendChild(indicator);
                
                // Hide indicator after first scroll
                container.addEventListener('scroll', function() {
                    indicator.style.opacity = '0';
                }, { once: true });
            }
        }
        
        // Add swipe indicators to horizontal containers
        setTimeout(() => {
            horizontalContainers.forEach(addSwipeIndicator);
        }, 1000);
    }
    
    // Viewport height fix for mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
    
    // Lazy loading for images on mobile
    if (isMobile && 'IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Observe images that can be lazy loaded
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Mobile-specific performance optimizations
    if (isMobile) {
        // Reduce animation complexity on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (max-width: 768px) {
                .wavy-line,
                .gallery-wavy-line {
                    animation-duration: 4s;
                }
                
                .light-bulb,
                .gallery-light-bulb {
                    animation-duration: 3s;
                }
                
                .hanging-event-card,
                .hanging-photo-frame,
                .package-card,
                .addon-card {
                    animation-duration: 6s;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Handle mobile orientation changes
window.addEventListener('orientationchange', function() {
    // Close mobile menu on orientation change
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
    
    // Recalculate positions after orientation change
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
});

// Mobile-friendly error handling
window.addEventListener('error', function(e) {
    console.log('Error caught:', e.error);
    // Don't show error alerts on mobile to avoid disrupting UX
});


