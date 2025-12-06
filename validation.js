// Form validation functions
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');
    const formGroup = field.closest('.form-group');
    
    // Clear previous error
    clearError(field);
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'name':
            if (value === '') {
                errorMessage = 'Full name is required';
                isValid = false;
            } else if (value.length < 4) {
                errorMessage = 'Name must be at least 4 characters long';
                isValid = false;
            } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
                errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                isValid = false;
            }
            break;
            
        case 'email':
            if (value === '') {
                errorMessage = 'Email address is required';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
            
        case 'strand':
            if (value === '') {
                errorMessage = 'Please select an academic strand';
                isValid = false;
            }
            break;
            
        case 'grade_level':
            if (value === '') {
                errorMessage = 'Please select a grade level';
                isValid = false;
            }
            break;
            
        case 'dob':
            if (value === '') {
                errorMessage = 'Date of birth is required';
                isValid = false;
            } else if (!isValidDate(value)) {
                errorMessage = 'Please enter a valid date of birth';
                isValid = false;
            } else if (!isOldEnough(value)) {
                errorMessage = 'Student must be at least 11 years old';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        showError(field, errorMessage);
    } else {
        markAsValid(field);
    }
    
    return isValid;
}

function validateForm() {
    const form = document.getElementById('registrationForm');
    const fields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function clearError(field) {
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');
    const formGroup = field.closest('.form-group');
    
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
    if (formGroup) {
        formGroup.classList.remove('error', 'success');
    }
}

function showError(field, message) {
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');
    const formGroup = field.closest('.form-group');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    if (formGroup) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
    }
}

function markAsValid(field) {
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function isOldEnough(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 11;
    }
    return age >= 11;
}

// Check if email already exists in database
function checkEmailExists(email) {
    try {
        const applications = getApplications();
        return applications.some(app => app.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

// Form submission handler
function handleFormSubmit(event) {
    if (event) {
        event.preventDefault();
    }
    
    console.log('Form submission started');
    
    // Validate form first
    if (!validateForm()) {
        showToast('Please fix the errors before submitting', 'error');
        return false;
    }
    
    showSpinner();
    
    try {
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            strand: document.getElementById('strand').value,
            grade_level: document.getElementById('grade_level').value,
            dob: document.getElementById('dob').value
        };
        
        console.log('Form data:', formData);
        
        // Check for duplicate email
        if (checkEmailExists(formData.email)) {
            hideSpinner();
            showToast('This email is already registered. Please use a different email.', 'error');
            showError(document.getElementById('email'), 'Email already exists');
            return false;
        }
        
        // Save to database
        console.log('Saving to database...');
        const success = saveApplication(formData);
        
        if (success) {
            console.log('Save successful');
            hideSpinner();
            closeModal();
            
            // Show confirmation modal
            const confirmationModal = document.getElementById('confirmationModal');
            if (confirmationModal) {
                confirmationModal.style.display = 'flex';
            }
            
            // Reset form
            document.getElementById('registrationForm').reset();
            
            // Clear all validation states
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('success', 'error');
            });
            
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(error => {
                error.style.display = 'none';
                error.textContent = '';
            });
            
            showToast('Application submitted successfully!', 'success');
            return true;
        } else {
            throw new Error('Failed to save application to database');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        hideSpinner();
        showToast('Error submitting application: ' + error.message, 'error');
        return false;
    }
}

// Event listeners setup
function setupFormValidation() {
    const form = document.getElementById('registrationForm');
    if (!form) {
        console.error('Registration form not found');
        return;
    }
    
    console.log('Setting up form validation...');
    
    // Remove any existing submit listeners to prevent duplicates
    form.removeEventListener('submit', handleFormSubmit);
    
    // Add form submission handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation on blur
    const fields = form.querySelectorAll('input[required], select[required]');
    fields.forEach(field => {
        // Remove existing listeners
        field.removeEventListener('blur', handleBlurValidation);
        field.removeEventListener('input', handleInputClear);
        
        // Add new listeners
        field.addEventListener('blur', handleBlurValidation);
        field.addEventListener('input', handleInputClear);
    });
    
    console.log('Form validation setup complete');
}

// Event handler functions
function handleBlurValidation() {
    validateField(this);
}

function handleInputClear() {
    clearError(this);
}

// Spinner functions
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Toast notification
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        document.body.appendChild(toastContainer);
        
        // Add basic toast styles if not already in CSS
        if (!document.querySelector('#toastStyles')) {
            const toastStyles = document.createElement('style');
            toastStyles.id = 'toastStyles';
            toastStyles.textContent = `
                .toast {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 5px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 350px;
                }
                .toast.show {
                    transform: translateX(0);
                }
                .toast-success {
                    background-color: #28a745;
                }
                .toast-error {
                    background-color: #dc3545;
                }
                .toast-info {
                    background-color: #17a2b8;
                }
            `;
            document.head.appendChild(toastStyles);
        }
    }
    
    const toast = document.createElement('div');
    toast.className = toast toast-${type};
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Add show class after a brief delay
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - setting up form validation');
    
    // Wait a bit for database to initialize, then setup form
    setTimeout(() => {
        setupFormValidation();
        console.log('Form validation initialized');
        
        // Test if form is properly set up
        const form = document.getElementById('registrationForm');
        if (form) {
            console.log('Form found and ready');
        } else {
            console.error('Form not found after initialization');
        }
    }, 1000);
});

// Make functions globally available for HTML onclick events
window.validateField = validateField;
window.validateForm = validateForm;
window.handleFormSubmit = handleFormSubmit;

// Add this to the end of your validation.js file
// Make sure all functions are globally available
window.setupFormValidation = setupFormValidation;
window.showToast = showToast;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.validateField = validateField;
window.validateForm = validateForm;
window.handleFormSubmit = handleFormSubmit;