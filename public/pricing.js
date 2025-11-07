// Pricing page JavaScript

let isYearlyBilling = false;

// Pricing data
const pricingData = {
    basic: {
        monthly: { price: 0, original: null },
        yearly: { price: 0, original: null }
    },
    pro: {
        monthly: { price: 78, original: null },
        yearly: { price: 749, original: 936 }  // (78 * 12) * 0.8 = 749, original: 78 * 12 = 936
    },
    enterprise: {
        monthly: { price: 1359, original: null },
        yearly: { price: 13046, original: 16308 }  // (1359 * 12) * 0.8 = 13046.4, original: 1359 * 12 = 16308
    }
};

// Removed auto-initialization - React components will call these functions manually
// document.addEventListener('DOMContentLoaded', function() {
//     initializePricing();
// });

function initializePricing() {
    initializeFAQ();
    updatePricingDisplay();
}

// Toggle between monthly and yearly billing
function toggleBilling() {
    const toggle = document.getElementById('billing-toggle');
    const monthlyLabel = document.getElementById('monthly-label');
    const yearlyLabel = document.getElementById('yearly-label');
    
    isYearlyBilling = !isYearlyBilling;
    
    // Update toggle appearance
    if (isYearlyBilling) {
        toggle.classList.add('active');
        monthlyLabel.classList.remove('active');
        yearlyLabel.classList.add('active');
    } else {
        toggle.classList.remove('active');
        monthlyLabel.classList.add('active');
        yearlyLabel.classList.remove('active');
    }
    
    // Update pricing display
    updatePricingDisplay();
}

// Update pricing display based on billing period
function updatePricingDisplay() {
    const billingPeriod = isYearlyBilling ? 'yearly' : 'monthly';
    
    Object.keys(pricingData).forEach(plan => {
        const data = pricingData[plan][billingPeriod];
        const priceElement = document.getElementById(`${plan}-price`);
        const billingElement = document.getElementById(`${plan}-billing`);
        const originalElement = document.getElementById(`${plan}-original`);
        const periodElement = document.querySelector(`[data-plan="${plan}"] .pricing-period`);
        
        if (priceElement) {
            priceElement.textContent = data.price;
        }
        
        // Update period text (/month or /year)
        if (periodElement) {
            periodElement.textContent = isYearlyBilling ? '/year' : '/month';
        }
        
        if (billingElement) {
            if (plan === 'basic') {
                billingElement.textContent = 'Free forever';
            } else {
                const period = isYearlyBilling ? 'year' : 'month';
                const billingType = isYearlyBilling ? 'annually' : 'monthly';
                billingElement.textContent = `per user, per ${period}, billed ${billingType}`;
            }
        }
        
        if (originalElement && data.original) {
            originalElement.textContent = `₱${data.original}`;
            originalElement.style.display = 'inline';
        } else if (originalElement) {
            originalElement.style.display = 'none';
        }
    });
}

// FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Set initial max-height for smooth animation
        answer.style.maxHeight = '0px';
    });
}

function toggleFaq(questionElement) {
    const faqItem = questionElement.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
            const otherAnswer = item.querySelector('.faq-answer');
            otherAnswer.style.maxHeight = '0px';
        }
    });
    
    // Toggle current FAQ item
    if (isActive) {
        faqItem.classList.remove('active');
        answer.style.maxHeight = '0px';
    } else {
        faqItem.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
    }
}

// Plan selection
function selectPlan(planName) {
    openPaymentModal(planName);
}

// Payment Modal Functions
function openPaymentModal(planName) {
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const selectedPlan = document.getElementById('selectedPlan');
    const selectedPrice = document.getElementById('selectedPrice');
    const monthlyPrice = document.getElementById('monthlyPrice');
    const pricePeriod = modal.querySelector('.price-period');
    
    // Update modal content based on selected plan
    const planData = pricingData[planName];
    const currentPrice = isYearlyBilling ? planData.yearly.price : planData.monthly.price;
    const period = isYearlyBilling ? 'year' : 'month';
    
    modalTitle.textContent = `Upgrade to ${planName.charAt(0).toUpperCase() + planName.slice(1)}`;
    selectedPlan.textContent = `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`;
    selectedPrice.textContent = `₱${currentPrice}`;
    monthlyPrice.textContent = currentPrice;
    
    // Update period text in modal
    if (pricePeriod) {
        pricePeriod.textContent = `/${period}`;
    }
    
    // Store selected plan for form submission
    modal.setAttribute('data-plan', planName);
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('paymentForm').reset();
    clearAllErrors();
}

// Form Validation Functions
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
    
    validateCardNumber(input);
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    
    validateExpiryDate(input);
}

function formatCVV(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    input.value = value;
    
    validateCVV(input);
}

function validateCardNumber(input) {
    const value = input.value.replace(/\s/g, '');
    const errorElement = document.getElementById('cardNumberError');
    
    if (value.length === 0) {
        setError(errorElement, '');
        return false;
    }
    
    if (value.length < 13 || value.length > 16) {
        setError(errorElement, 'Card number must be 13-16 digits');
        return false;
    }
    
    if (!luhnCheck(value)) {
        setError(errorElement, 'Invalid card number');
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function validateExpiryDate(input) {
    const value = input.value;
    const errorElement = document.getElementById('expiryError');
    
    if (value.length === 0) {
        setError(errorElement, '');
        return false;
    }
    
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
        setError(errorElement, 'Invalid format (MM/YY)');
        return false;
    }
    
    const [month, year] = value.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        setError(errorElement, 'Card has expired');
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function validateCVV(input) {
    const value = input.value;
    const errorElement = document.getElementById('cvvError');
    
    if (value.length === 0) {
        setError(errorElement, '');
        return false;
    }
    
    if (value.length < 3 || value.length > 4) {
        setError(errorElement, 'CVV must be 3-4 digits');
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function validateCardName(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('cardNameError');
    
    if (value.length === 0) {
        setError(errorElement, 'Cardholder name is required');
        return false;
    }
    
    if (value.length < 2) {
        setError(errorElement, 'Name too short');
        return false;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(value)) {
        setError(errorElement, 'Name can only contain letters and spaces');
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function validateEmail(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('emailError');
    
    if (value.length === 0) {
        setError(errorElement, 'Email is required');
        return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(errorElement, 'Invalid email format');
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function validateRequired(input, errorElementId, fieldName) {
    const value = input.value.trim();
    const errorElement = document.getElementById(errorElementId);
    
    if (value.length === 0) {
        setError(errorElement, `${fieldName} is required`);
        return false;
    }
    
    setError(errorElement, '');
    return true;
}

function setError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        const input = errorElement.parentElement.querySelector('input, select');
        if (input) {
            if (message) {
                input.style.borderColor = 'var(--error-color)';
            } else {
                input.style.borderColor = 'var(--border-color)';
            }
        }
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => setError(element, ''));
}

// Luhn algorithm for card validation
function luhnCheck(cardNumber) {
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let n = parseInt(cardNumber.charAt(i), 10);
        
        if (alternate) {
            n *= 2;
            if (n > 9) {
                n = (n % 10) + 1;
            }
        }
        
        sum += n;
        alternate = !alternate;
    }
    
    return (sum % 10) === 0;
}

// Payment form submission
function processPayment(event) {
    event.preventDefault();
    
    // For free trial, redirect directly to index.php
    window.location.href = 'index.php';
}

// Payment method selection
// Removed auto-initialization - React components will call these functions manually
/*
document.addEventListener('DOMContentLoaded', function() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    const cardDetails = document.getElementById('cardDetails');
    
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Show/hide card details
            const paymentMethod = this.querySelector('input[name="paymentMethod"]').value;
            if (paymentMethod === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
    
    // Add real-time validation
    document.getElementById('cardNumber').addEventListener('input', function() {
        formatCardNumber(this);
    });
    
    document.getElementById('expiryDate').addEventListener('input', function() {
        formatExpiryDate(this);
    });
    
    document.getElementById('cvv').addEventListener('input', function() {
        formatCVV(this);
    });
    
    document.getElementById('cardName').addEventListener('blur', function() {
        validateCardName(this);
    });
    
    document.getElementById('email').addEventListener('blur', function() {
        validateEmail(this);
    });
    
    document.getElementById('firstName').addEventListener('blur', function() {
        validateRequired(this, 'firstNameError', 'First name');
    });
    
    document.getElementById('lastName').addEventListener('blur', function() {
        validateRequired(this, 'lastNameError', 'Last name');
    });
    
    document.getElementById('country').addEventListener('change', function() {
        validateRequired(this, 'countryError', 'Country');
    });
    
    // Close modal on outside click
    document.getElementById('paymentModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePaymentModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('paymentModal');
            if (modal.style.display === 'flex') {
                closePaymentModal();
            }
        }
    });
});
*/

// Contact sales
function contactSales() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Contact Sales</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="contact-sales-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company Email</label>
                        <input type="email" class="form-input" placeholder="Enter your company email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company Name</label>
                        <input type="text" class="form-input" placeholder="Enter your company name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Team Size</label>
                        <select class="form-input" required>
                            <option value="">Select team size</option>
                            <option value="1-10">1-10 people</option>
                            <option value="11-50">11-50 people</option>
                            <option value="51-200">51-200 people</option>
                            <option value="201-1000">201-1000 people</option>
                            <option value="1000+">1000+ people</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message (Optional)</label>
                        <textarea class="form-input" rows="3" placeholder="Tell us about your needs..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="submitContactForm(this)">Send Message</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Schedule demo
function scheduleDemo() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Schedule a Demo</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="schedule-demo-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-input" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company Name</label>
                        <input type="text" class="form-input" placeholder="Enter your company name" required>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Preferred Date</label>
                            <input type="date" class="form-input" min="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preferred Time</label>
                            <select class="form-input" required>
                                <option value="">Select time</option>
                                <option value="9:00 AM">9:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="1:00 PM">1:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="3:00 PM">3:00 PM</option>
                                <option value="4:00 PM">4:00 PM</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">What would you like to see?</label>
                        <textarea class="form-input" rows="3" placeholder="Tell us what features you're most interested in..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="submitDemoForm(this)">Schedule Demo</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Focus first input
    const firstInput = modal.querySelector('input');
    if (firstInput) {
        firstInput.focus();
    }
}

// Submit contact form
function submitContactForm(button) {
    const form = document.getElementById('contact-sales-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    // Basic validation
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    button.disabled = true;
    button.textContent = 'Sending...';
    
    // Simulate form submission
    setTimeout(() => {
        button.closest('.modal').remove();
        showNotification('Thank you! Our sales team will contact you within 24 hours.', 'success');
    }, 2000);
}

// Submit demo form
function submitDemoForm(button) {
    const form = document.getElementById('schedule-demo-form');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    // Basic validation
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = 'var(--danger-color)';
            isValid = false;
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    button.disabled = true;
    button.textContent = 'Scheduling...';
    
    // Simulate form submission
    setTimeout(() => {
        button.closest('.modal').remove();
        showNotification('Demo scheduled! You\'ll receive a calendar invite shortly.', 'success');
    }, 2000);
}

// Scroll to pricing cards when coming from other pages
function scrollToPricing() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'pricing') {
        const pricingCards = document.querySelector('.pricing-cards');
        if (pricingCards) {
            setTimeout(() => {
                pricingCards.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
}

// Initialize scroll behavior
// Removed auto-initialization - React components will call these functions manually
/*
document.addEventListener('DOMContentLoaded', function() {
    scrollToPricing();
});
*/

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Toggle billing with 'B' key
    if (e.key === 'b' || e.key === 'B') {
        if (!document.querySelector('.modal.active')) {
            toggleBilling();
        }
    }
    
    // Quick plan selection
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                // Basic plan is current, no action needed
                showNotification('You\'re already on the Basic plan', 'info');
                break;
            case '2':
                e.preventDefault();
                selectPlan('pro');
                break;
            case '3':
                e.preventDefault();
                contactSales();
                break;
        }
    }
});

// Add comparison tooltip functionality
function addComparisonTooltips() {
    const features = document.querySelectorAll('.pricing-feature-text');
    
    features.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            // Add tooltip with feature explanation
            const tooltip = document.createElement('div');
            tooltip.className = 'feature-tooltip';
            tooltip.textContent = getFeatureDescription(this.textContent);
            tooltip.style.cssText = `
                position: absolute;
                background: var(--text-primary);
                color: white;
                padding: 0.5rem;
                border-radius: var(--border-radius);
                font-size: 0.75rem;
                z-index: 1000;
                max-width: 200px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            
            // Show tooltip
            setTimeout(() => tooltip.style.opacity = '1', 100);
            
            // Remove on mouse leave
            this.addEventListener('mouseleave', function() {
                if (tooltip.parentNode) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => tooltip.remove(), 200);
                }
            }, { once: true });
        });
    });
}

function getFeatureDescription(featureText) {
    const descriptions = {
        'Up to 3 boards': 'Create up to 3 project boards to organize your work',
        'Up to 5 team members': 'Invite up to 5 people to collaborate on your projects',
        'Basic task management': 'Create, assign, and track tasks with due dates',
        'Mobile app access': 'Access your projects on iOS and Android devices',
        'Email support': 'Get help via email during business hours',
        'Unlimited boards': 'Create as many project boards as you need',
        'Up to 25 team members': 'Scale your team up to 25 collaborators',
        'Advanced task management': 'Custom fields, templates, and automation',
        'Calendar integration': 'Sync with Google Calendar, Outlook, and more',
        'Advanced reporting': 'Detailed analytics and progress reports',
        'Third-party integrations': 'Connect with Slack, GitHub, Jira, and more',
        'Priority email support': 'Faster response times and priority handling',
        'Custom integrations': 'Build custom integrations with our API',
        'Dedicated account manager': 'Personal support from a dedicated team member',
        '24/7 phone support': 'Round-the-clock support via phone',
        'SLA guarantee': '99.9% uptime guarantee with service credits',
        'On-premise deployment': 'Host WorkShift on your own infrastructure'
    };
    
    return descriptions[featureText] || 'Learn more about this feature';
}

// Initialize tooltips
// Removed auto-initialization - React components will call these functions manually
/*
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addComparisonTooltips, 1000);
});
*/

// Handle plan comparison
function showPlanComparison() {
    // This would show a detailed comparison table
    showNotification('Plan comparison feature coming soon!', 'info');
}

// Auto-update pricing based on team size
function updatePricingForTeamSize(teamSize) {
    // This would calculate pricing based on actual team size
    // For demo purposes, we'll just show a notification
    showNotification(`Pricing updated for team size: ${teamSize}`, 'info');
}
