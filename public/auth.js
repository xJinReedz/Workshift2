// Authentication JavaScript

// Initialize login form
function initializeLoginForm() {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-btn');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Add input validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    emailInput.addEventListener('input', validateLoginForm);
    passwordInput.addEventListener('input', validateLoginForm);
    
    // Initialize password toggle
    initializePasswordToggle();
    
    // Pre-fill demo credentials
    emailInput.value = 'john@gmail.com';
    passwordInput.value = 'workshift123@@';
}

// Initialize register form
function initializeRegisterForm() {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        validatePasswordMatch();
    });
    
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    
    // Initialize password toggles
    initializeRegisterPasswordToggles();
    
    // Form validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('input', validateRegisterForm);
    });
}

// Initialize forgot password form
function initializeForgotPasswordForm() {
    const form = document.getElementById('forgot-password-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleForgotPassword();
    });
}

// Initialize reset password form
function initializeResetPasswordForm() {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleResetPassword();
    });
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        validatePasswordMatch();
    });
    
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    
    // Initialize password toggles
    initializeResetPasswordToggles();
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const submitBtn = document.getElementById('login-btn');
    
    // Basic validation
    if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAuthError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    submitBtn.classList.add('auth-loading');
    
    try {
        // Call the API
        const result = await window.api.login({ email, password });
        
        if (result.success) {
            // Store user data if remember is checked
            if (remember) {
                localStorage.setItem('workshift_user', JSON.stringify({
                    email: email,
                    name: result.data.user.first_name + ' ' + result.data.user.last_name,
                    avatar: result.data.user.avatar
                }));
            }
            
            showAuthSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showAuthError(result.message || 'Login failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
            submitBtn.classList.remove('auth-loading');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        submitBtn.classList.remove('auth-loading');
    }
}

// Handle register
async function handleRegister() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = document.getElementById('register-btn');
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showAuthError('Please fill in all required fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAuthError('Please enter a valid email address');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showAuthError('Password must be at least 8 characters long');
        return;
    }
    
    if (!terms) {
        showAuthError('Please accept the Terms of Service and Privacy Policy');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.classList.add('auth-loading');
    
    try {
        // Call the API
        const result = await window.api.register({ 
            first_name: firstName,
            last_name: lastName,
            email,
            password
        });
        
        if (result.success) {
            showAuthSuccess('Account created successfully! Redirecting to login...');
            
            // Redirect to login after success
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAuthError(result.message || 'Registration failed');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            submitBtn.classList.remove('auth-loading');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        submitBtn.classList.remove('auth-loading');
    }
}

// Handle forgot password
function handleForgotPassword() {
    const email = document.getElementById('email').value;
    const submitBtn = document.getElementById('reset-btn');
    
    if (!email) {
        showAuthError('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAuthError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('auth-loading');
    
    // Simulate API call
    setTimeout(() => {
        showAuthSuccess('Password reset link sent! Check your email for instructions.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
        submitBtn.classList.remove('auth-loading');
    }, 2000);
}

// Handle reset password
function handleResetPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('update-password-btn');
    
    if (!password || !confirmPassword) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        showAuthError('Password must be at least 8 characters long');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating Password...';
    submitBtn.classList.add('auth-loading');
    
    // Simulate API call
    setTimeout(() => {
        showAuthSuccess('Password updated successfully! You can now sign in with your new password.');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }, 2000);
}

// Handle social login
function handleSocialLogin(provider) {
    // Simulate social login redirect
    setTimeout(() => {
        // In a real app, this would redirect to the OAuth provider
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize password toggle functionality
function initializePasswordToggle() {
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordToggle && passwordInput && passwordToggleIcon) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, passwordToggleIcon, passwordToggle);
        });
    }
}

// Toggle password visibility
function togglePasswordVisibility(passwordInput, icon, button) {
    const isPassword = passwordInput.type === 'password';
    
    // Toggle input type
    passwordInput.type = isPassword ? 'text' : 'password';
    
    // Toggle icon
    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    
    // Update aria-label for accessibility
    button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    
    // Brief focus back to input to maintain user experience
    passwordInput.focus();
}

// Initialize password toggles for register form
function initializeRegisterPasswordToggles() {
    // Main password field
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordToggle && passwordInput && passwordToggleIcon) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, passwordToggleIcon, passwordToggle);
        });
    }
    
    // Confirm password field
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordToggleIcon = document.getElementById('confirm-password-toggle-icon');
    
    if (confirmPasswordToggle && confirmPasswordInput && confirmPasswordToggleIcon) {
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggleIcon, confirmPasswordToggle);
        });
    }
}

// Initialize password toggles for reset password form
function initializeResetPasswordToggles() {
    // Main password field
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordToggle && passwordInput && passwordToggleIcon) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, passwordToggleIcon, passwordToggle);
        });
    }
    
    // Confirm password field
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordToggleIcon = document.getElementById('confirm-password-toggle-icon');
    
    if (confirmPasswordToggle && confirmPasswordInput && confirmPasswordToggleIcon) {
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggleIcon, confirmPasswordToggle);
        });
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strength-fill');
    const strengthLevel = document.getElementById('strength-level');
    const strengthText = document.getElementById('strength-text');
    
    if (!strengthFill || !strengthLevel) return;
    
    let strength = 0;
    let level = 'weak';
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Determine strength level
    if (strength <= 2) {
        level = 'weak';
    } else if (strength <= 3) {
        level = 'fair';
    } else if (strength <= 4) {
        level = 'good';
    } else {
        level = 'strong';
    }
    
    // Update UI
    strengthFill.className = `password-strength-fill ${level}`;
    strengthLevel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    strengthText.className = `password-strength-text ${level}`;
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = 'var(--danger-color)';
        return false;
    } else if (confirmPassword) {
        confirmInput.style.borderColor = 'var(--success-color)';
        return true;
    } else {
        confirmInput.style.borderColor = 'var(--border-color)';
        return false;
    }
}

// Form validation
function validateLoginForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('login-btn');
    
    const isValid = email && password && isValidEmail(email);
    submitBtn.disabled = !isValid;
}

function validateRegisterForm() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const submitBtn = document.getElementById('register-btn');
    
    const isValid = firstName && lastName && email && password && 
                   confirmPassword && terms && isValidEmail(email) &&
                   password === confirmPassword && password.length >= 8;
    
    submitBtn.disabled = !isValid;
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    const errorMessage = document.getElementById('error-message');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.classList.add('show');
        
        if (successDiv) {
            successDiv.classList.remove('show');
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showAuthSuccess(message) {
    const successDiv = document.getElementById('auth-success');
    const successMessage = document.getElementById('success-message');
    const errorDiv = document.getElementById('auth-error');
    
    if (successDiv && successMessage) {
        successMessage.textContent = message;
        successDiv.classList.add('show');
        
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }
}

// Auto-fill demo data for testing
function fillDemoData() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'register.php') {
        document.getElementById('firstName').value = 'John';
        document.getElementById('lastName').value = 'Doe';
        document.getElementById('email').value = 'john.doe@example.com';
        document.getElementById('password').value = 'SecurePass123!';
        document.getElementById('confirmPassword').value = 'SecurePass123!';
        document.getElementById('terms').checked = true;
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key submits form
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const form = document.querySelector('.auth-form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // Demo data shortcut (Ctrl+D)
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        fillDemoData();
    }
});

// Auto-focus first input
document.addEventListener('DOMContentLoaded', function() {
    const firstInput = document.querySelector('.auth-form input');
    if (firstInput) {
        firstInput.focus();
    }
});

// Form animations
function addFormAnimation() {
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
        authForm.classList.add('auth-form-slide-in');
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addFormAnimation, 100);
});

// Handle browser back button
window.addEventListener('popstate', function(e) {
    // Reset form states when navigating back
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => form.reset());
    
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels
    const inputs = document.querySelectorAll('.auth-form-input');
    inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
            input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
            if (!label.id) {
                label.id = `label-${input.id}`;
            }
        }
    });
    
    // Add role attributes
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) {
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'polite');
    }
    
    if (successDiv) {
        successDiv.setAttribute('role', 'status');
        successDiv.setAttribute('aria-live', 'polite');
    }
});
