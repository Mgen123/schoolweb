document.addEventListener("DOMContentLoaded", function() {
    const gradeSelect = document.getElementById("grade_level");
    const strandSelect = document.getElementById("strand");

    gradeSelect.addEventListener("change", function() {
        const grade = this.value;

        // Clear existing options
        strandSelect.innerHTML = '<option value="">Select a strand</option>';

        if (grade) {
            fetch(`/get_strands/${encodeURIComponent(grade)}`)
                .then(response => response.json())
                .then(data => {
                    data.forEach(strand => {
                        const option = document.createElement("option");
                        option.value = strand;
                        option.textContent = strand;
                        strandSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error("Error fetching strands:", error);
                });
        }
    });
});

// Preloader functionality
document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    const body = document.body;
    
    let progress = 0;
    const totalTime = 5000; // Changed from 3000 to 5000 (5 seconds total loading time)
    const intervalTime = 30; // Update every 30ms
    const increment = (intervalTime / totalTime) * 100;
    
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // Hide preloader and show content
            setTimeout(() => {
                preloader.classList.add('loaded');
                body.classList.remove('loading');
                body.classList.add('loaded');
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, intervalTime);
    
    // Also hide preloader when everything is actually loaded
    window.addEventListener('load', function() {
        clearInterval(loadingInterval);
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            preloader.classList.add('loaded');
            body.classList.remove('loading');
            body.classList.add('loaded');
        }, 500);
    });
});

// Ensure video plays automatically and loops
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('heroVideo');
    
    // Force video to play (for some browser restrictions)
    video.play().catch(function(error) {
        console.log('Video autoplay failed:', error);
        // Show play button if autoplay is blocked
        showPlayButton();
    });
    
    // Ensure video loops properly
    video.addEventListener('ended', function() {
        video.currentTime = 0;
        video.play();
    });
    
    // Handle visibility change - restart video when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && video.paused) {
            video.play();
        }
    });
});

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        // Toggle hamburger icon
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
    
    // Mobile dropdown functionality
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        
        dropdownLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Close mobile menu when clicking on a link
    navLinks.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && window.innerWidth <= 768) {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

function showPlayButton() {
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Video';
    playBtn.className = 'btn play-video-btn';
    playBtn.style.position = 'absolute';
    playBtn.style.bottom = '20px';
    playBtn.style.left = '20px';
    playBtn.style.zIndex = '3';
    playBtn.onclick = function() {
        document.getElementById('heroVideo').play();
        playBtn.remove();
    };
    document.querySelector('.hero').appendChild(playBtn);
}



// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileNav();
    initHeroSlideshow();
    initFacilitiesSlideshow();
    initStrandDetails();
    initSmoothScrolling();
    initNavbarScroll();
    initFacultyAnimations();
    
    // Note: Form validation is now handled by validation.js
    console.log('Application initialized successfully');
});

// Mobile Navigation
function initMobileNav() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const navLinksList = document.querySelectorAll('.nav-links a');
        navLinksList.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }
}

// Hero Slideshow functionality
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slideshow-dot');
    const prevBtn = document.querySelector('.slideshow-prev');
    const nextBtn = document.querySelector('.slideshow-next');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let slideInterval;
    
    function showSlide(index) {
        // Handle infinite loop
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        // Hide all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide and activate dot
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        
        currentSlide = index;
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function pauseSlideShow() {
        clearInterval(slideInterval);
    }
    
    // Initialize
    showSlide(currentSlide);
    startSlideShow();
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => {
        pauseSlideShow();
        prevSlide();
        startSlideShow();
    });
    
    if (nextBtn) nextBtn.addEventListener('click', () => {
        pauseSlideShow();
        nextSlide();
        startSlideShow();
    });
    
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-index'));
            pauseSlideShow();
            showSlide(slideIndex);
            startSlideShow();
        });
    });
    
    // Pause on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', pauseSlideShow);
        slideshowContainer.addEventListener('mouseleave', startSlideShow);
    }
}

// Facilities Slideshow Functionality
function initFacilitiesSlideshow() {
    const slides = document.querySelectorAll('.facility-slide');
    const dots = document.querySelectorAll('.facility-dot');
    const miniCards = document.querySelectorAll('.facility-mini-card');
    const prevBtn = document.querySelector('.facility-prev');
    const nextBtn = document.querySelector('.facility-next');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        miniCards.forEach(card => card.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        miniCards[index].classList.add('active');
        
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    miniCards.forEach((card, index) => {
        card.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance slides
    let slideInterval = setInterval(nextSlide, 5000);

    const slideshowContainer = document.querySelector('.facilities-slideshow');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
        slideshowContainer.addEventListener('mouseleave', () => slideInterval = setInterval(nextSlide, 5000));
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        else if (e.key === 'ArrowRight') nextSlide();
    });
}

// Strand Detail Functionality (New Design)
function initStrandDetails() {
    const strandCards = document.querySelectorAll('.strand-card');
    const strandDetails = document.querySelectorAll('.strand-details');
    
    if (!strandCards.length) return;
    
    // Open strand detail
    strandCards.forEach(card => {
        card.addEventListener('click', function() {
            const strandType = this.getAttribute('data-strand');
            openStrandDetail(strandType);
        });
    });
    
    // Close on overlay click
    strandDetails.forEach(detail => {
        detail.addEventListener('click', function(e) {
            if (e.target === this) {
                const strandType = this.id.replace('-details', '');
                closeStrandDetail(strandType);
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllStrandDetails();
    });
}

function openStrandDetail(strandType) {
    const detailElement = document.getElementById(`${strandType}-details`);
    if (detailElement) {
        detailElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeStrandDetail(strandType) {
    const detailElement = document.getElementById(`${strandType}-details`);
    if (detailElement) {
        detailElement.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllStrandDetails() {
    const strandDetails = document.querySelectorAll('.strand-details');
    strandDetails.forEach(detail => detail.classList.remove('active'));
    document.body.style.overflow = '';
}

// Smooth scrolling
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile menu functionality
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const navLinks = document.querySelector('.nav-links');
            
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', function() {
                    navLinks.classList.toggle('active');
                });
            }

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks) {
        navLinks.classList.toggle('active');
        
        // Change hamburger icon
        if (navLinks.classList.contains('active')) {
            mobileBtn.innerHTML = '✕'; // Close icon
        } else {
            mobileBtn.innerHTML = '☰'; // Hamburger icon
        }
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(event.target) && !mobileBtn.contains(event.target)) {
            navLinks.classList.remove('active');
            if (mobileBtn) {
                mobileBtn.innerHTML = '☰';
            }
        }
    }
});

// Close mobile menu when clicking a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-links');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileBtn) {
                    mobileBtn.innerHTML = '☰';
                }
            }
        });
    });
});

// Make dropdown work on mobile
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
});

// Debug function to check mobile menu setup
function debugMobileMenu() {
    console.log('=== Mobile Menu Debug ===');
    
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('Mobile button found:', mobileBtn);
    console.log('Mobile button HTML:', mobileBtn ? mobileBtn.outerHTML : 'NOT FOUND');
    console.log('Nav links found:', navLinks);
    console.log('Nav links HTML:', navLinks ? navLinks.outerHTML : 'NOT FOUND');
    
    if (mobileBtn) {
        console.log('Mobile button onclick:', mobileBtn.onclick);
        console.log('Mobile button has onclick attribute:', mobileBtn.hasAttribute('onclick'));
    }
    
    console.log('Window width:', window.innerWidth);
    console.log('Is mobile view (<=768px):', window.innerWidth <= 768);
    console.log('=== End Debug ===');
}

// Call it from console: debugMobileMenu()
window.debugMobileMenu = debugMobileMenu;

// Faculty card animation
function initFacultyAnimations() {
    const facultyCards = document.querySelectorAll('.faculty-card');
    if (!facultyCards.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    facultyCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Modal functions
function openModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) modal.style.display = 'none';
}

function closeConfirmation() {
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.style.display = 'none';
}

function closeApplications() {
    const modal = document.getElementById('applicationsModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modals = [
        'registrationModal',
        'confirmationModal', 
        'applicationsModal'
    ];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) {
            if (modalId === 'registrationModal') closeModal();
            if (modalId === 'confirmationModal') closeConfirmation();
            if (modalId === 'applicationsModal') closeApplications();
        }
    });
});

// Toast notification (fallback - use the one from validation.js if available)
function showToast(message, type = 'success') {
    // Use the validation.js showToast if available, otherwise use this fallback
    if (window.showToast && window.showToast !== showToast) {
        window.showToast(message, type);
        return;
    }
    
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Spinner functions (fallback - use the ones from validation.js if available)
function showSpinner() {
    if (window.showSpinner && window.showSpinner !== showSpinner) {
        window.showSpinner();
        return;
    }
    
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'flex';
}

function hideSpinner() {
    if (window.hideSpinner && window.hideSpinner !== hideSpinner) {
        window.hideSpinner();
        return;
    }
    
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'none';
}

// View applications (fallback - use the one from app.js if available)
function viewApplications() {
    if (window.viewApplications && window.viewApplications !== viewApplications) {
        window.viewApplications();
        return;
    }
    
    const applications = getApplications();
    const applicationsList = document.getElementById('applicationsList');
    
    if (!applicationsList) return;
    
    applicationsList.innerHTML = '';
    
    if (applications.length === 0) {
        applicationsList.innerHTML = '<p class="no-data">No applications found.</p>';
    } else {
        applications.forEach((app, index) => {
            const appElement = document.createElement('div');
            appElement.className = 'application-item';
            appElement.innerHTML = `
                <div class="application-header">
                    <span class="application-name">${escapeHtml(app.name)}</span>
                    <span class="application-date">${new Date(app.submitted_at).toLocaleDateString()}</span>
                </div>
                <div class="application-details">
                    <div class="application-detail">
                        <span class="detail-label">Email</span>
                        <span>${escapeHtml(app.email)}</span>
                    </div>
                    <div class="application-detail">
                        <span class="detail-label">Strand</span>
                        <span>${escapeHtml(app.strand)}</span>
                    </div>
                    <div class="application-detail">
                        <span class="detail-label">Grade Level</span>
                        <span>${escapeHtml(app.grade_level)}</span>
                    </div>
                    <div class="application-detail">
                        <span class="detail-label">Date of Birth</span>
                        <span>${app.dob}</span>
                    </div>
                    <div class="application-detail">
                        <span class="detail-label">Status</span>
                        <span class="status-pending">Pending</span>
                    </div>
                </div>
            `;
            applicationsList.appendChild(appElement);
        });
    }
    
    closeConfirmation();
    const applicationsModal = document.getElementById('applicationsModal');
    if (applicationsModal) applicationsModal.style.display = 'flex';
}

// Export data (fallback - use the one from app.js if available)
function exportData() {
    if (window.exportData && window.exportData !== exportData) {
        window.exportData();
        return;
    }
    
    const applications = getApplications();
    if (applications.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Strand,Grade Level,Date of Birth,Submitted At\n";
    
    applications.forEach(app => {
        csvContent += `"${app.name.replace(/"/g, '""')}","${app.email}","${app.strand}","${app.grade_level}","${app.dob}","${app.submitted_at}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported successfully');
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Database functions - these should use your existing database.js functions
function getApplications() {
    // Use your existing getApplications function from database.js
    if (typeof getApplications === 'function' && getApplications !== window.getApplications) {
        return getApplications();
    }
    
    // Fallback: try to get from database.js
    try {
        if (typeof window.getApplications === 'function') {
            return window.getApplications();
        }
    } catch (error) {
        console.error('Error getting applications:', error);
    }
    
    return [];
}

document.getElementById("grade_level").addEventListener("change", function() {
        const strandGroup = document.getElementById("strand-group");
        const selectedGrade = this.value;

        // Show strand only for Grade 11 and 12
        if (["Grade 11", "Grade 12"].includes(selectedGrade)) {
            strandGroup.style.display = "block";
            document.getElementById("strand").setAttribute("required", "true");
        } else {
            strandGroup.style.display = "none";
            document.getElementById("strand").removeAttribute("required");
        }
    });

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.closeConfirmation = closeConfirmation;
window.closeApplications = closeApplications;
window.viewApplications = viewApplications;
window.exportData = exportData;
window.showToast = showToast;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;

// Locate Us Functions
function getDirections() {
    const address = "Ipilan National High School, Barangay Ipilan, Brooke's Point, Palawan, Philippines";
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
}

function copySchoolAddress() {
    const address = "Ipilan National High School, Barangay Ipilan, Brooke's Point, Palawan, Philippines";
    
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(() => {
            showNotification('Address copied to clipboard!', 'success');
        }).catch(err => {
            fallbackCopyText(address);
        });
    } else {
        fallbackCopyText(address);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Address copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy address', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add animation styles
const animationStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = animationStyles;
document.head.appendChild(styleEl);

// Add at the end of your existing code
document.addEventListener('DOMContentLoaded', function() {
    // Initialize feedback management if section exists
    if (document.getElementById('feedbackTable')) {
        initializeFeedback();
    }
});





