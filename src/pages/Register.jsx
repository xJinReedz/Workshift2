import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: '', text: 'Enter a password', fill: 0 });

  useEffect(() => {
    const initializePage = () => {
      // Redirect if already authenticated
      if (window.api && window.api.isAuthenticated()) {
        navigate('/');
        return;
      }
      
      // Initialize register form - keeping original logic
      setTimeout(() => {
        if (window.initializeRegisterForm) {
          window.initializeRegisterForm();
        }
        
        // Ensure button is enabled by default (will be controlled by validation)
        const submitBtn = document.getElementById('register-btn');
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }, 100);
      
      // Override the original register redirect to use React Router
      const originalHandleRegister = window.handleRegister;
      if (originalHandleRegister) {
        window.handleRegister = async function() {
          const firstName = document.getElementById('firstName').value;
          const lastName = document.getElementById('lastName').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;
          const terms = document.getElementById('terms').checked;
          const submitBtn = document.getElementById('register-btn');
          
          // Basic validation
          if (!firstName || !lastName || !email || !password || !confirmPassword) {
            window.showAuthError('Please fill in all required fields');
            return;
          }
          
          if (!window.isValidEmail(email)) {
            window.showAuthError('Please enter a valid email address');
            return;
          }
          
          if (password !== confirmPassword) {
            window.showAuthError('Passwords do not match');
            return;
          }
          
          if (password.length < 8) {
            window.showAuthError('Password must be at least 8 characters long');
            return;
          }
          
          if (!terms) {
            window.showAuthError('Please accept the Terms of Service and Privacy Policy');
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
              window.showAuthSuccess('Account created successfully! Redirecting to login...');
              
              // Use React Router navigation instead of window.location
              setTimeout(() => {
                navigate('/login');
              }, 2000);
            } else {
              window.showAuthError(result.message || 'Registration failed');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Account';
              submitBtn.classList.remove('auth-loading');
            }
          } catch (error) {
            console.error('Registration error:', error);
            window.showAuthError('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            submitBtn.classList.remove('auth-loading');
          }
        };
      }
    };

    initializePage();

    // Initialize database and API when component mounts
    if (window.db && window.api) {
      initializePage();
    } else {
      // Wait for scripts to load
      const checkScripts = setInterval(() => {
        if (window.db && window.api) {
          clearInterval(checkScripts);
          initializePage();
        }
      }, 100);
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    let level = '';
    let text = '';
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    switch (strength) {
      case 0:
      case 1:
        level = 'weak';
        text = 'Weak';
        break;
      case 2:
      case 3:
        level = 'medium';
        text = 'Medium';
        break;
      case 4:
      case 5:
        level = 'strong';
        text = 'Strong';
        break;
      default:
        level = '';
        text = 'Enter a password';
    }
    
    setPasswordStrength({
      level,
      text,
      fill: (strength / 5) * 100
    });
  };

  const handlePasswordChange = (e) => {
    checkPasswordStrength(e.target.value);
  };

  const handleSocialLogin = async (provider) => {
    // Use real authentication with luc@gmail.com credentials for Google login/register
    if (provider === 'Google') {
      const submitBtn = document.querySelector('.social-login-btn.google');
      
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fab fa-google social-login-icon"></i> Signing in...';
      }
      
      try {
        // Call the actual API login with luc@gmail.com credentials
        const result = await window.api.login({ 
          email: 'luc@gmail.com', 
          password: 'workshift123@@' 
        });
        
        if (result.success) {
          // Store user data
          localStorage.setItem('workshift_user', JSON.stringify({
            email: 'luc@gmail.com',
            name: result.data.user.first_name + ' ' + result.data.user.last_name,
            avatar: result.data.user.avatar
          }));
          
          // Navigate to board
          navigate('/');
        } else {
          window.showAuthError('Google sign-up failed. Please try again.');
        }
      } catch (error) {
        console.error('Google sign-up error:', error);
        window.showAuthError('Google sign-up failed. Please try again.');
      } finally {
        // Reset button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fab fa-google social-login-icon"></i> Continue with Google';
        }
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="auth-logo-text">WorkShift</div>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start managing your projects today</p>
        </div>

        {/* Error Message */}
        <div className="auth-error" id="auth-error">
          <i className="fas fa-exclamation-triangle auth-error-icon"></i>
          <span id="error-message"></span>
        </div>

        {/* Success Message */}
        <div className="auth-success" id="auth-success">
          <i className="fas fa-check-circle auth-success-icon"></i>
          <span id="success-message"></span>
        </div>

        <form className="auth-form" id="register-form">
          <div className="name-fields-container">
            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                className="auth-form-input" 
                placeholder="First name"
                required
                autoComplete="given-name"
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                className="auth-form-input" 
                placeholder="Last name"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="auth-form-input" 
              placeholder="Enter your email address"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="password">Password</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                className="auth-form-input password-input" 
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
                onChange={handlePasswordChange}
              />
              <button 
                type="button" 
                className="password-toggle" 
                id="password-toggle" 
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={togglePasswordVisibility}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} id="password-toggle-icon"></i>
              </button>
            </div>
            <div className="password-strength" id="password-strength">
              <div className="password-strength-bar">
                <div 
                  className={`password-strength-fill ${passwordStrength.level}`} 
                  id="strength-fill"
                  style={{width: `${passwordStrength.fill}%`}}
                ></div>
              </div>
              <div className="password-strength-text" id="strength-text">
                Password strength: <span id="strength-level">{passwordStrength.text}</span>
              </div>
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                id="confirmPassword" 
                className="auth-form-input password-input" 
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
              <button 
                type="button" 
                className="password-toggle" 
                id="confirm-password-toggle" 
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                onClick={toggleConfirmPasswordVisibility}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} id="confirm-password-toggle-icon"></i>
              </button>
            </div>
          </div>

          <div className="auth-form-checkbox">
            <input type="checkbox" id="terms" name="terms" required />
            <label htmlFor="terms">
              I agree to the <button type="button" className="link-button" onClick={() => alert('Terms of Service - This would open the terms page')}>Terms of Service</button> and 
              <button type="button" className="link-button" onClick={() => alert('Privacy Policy - This would open the privacy policy page')}>Privacy Policy</button>
            </label>
          </div>

          <div className="auth-form-checkbox">
            <input type="checkbox" id="newsletter" name="newsletter" />
            <label htmlFor="newsletter">
              Send me product updates and tips via email
            </label>
          </div>

          <button type="submit" className="auth-submit-btn" id="register-btn">
            Create Account
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-login-btn google" onClick={() => handleSocialLogin('Google')}>
            <i className="fab fa-google social-login-icon"></i>
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">Already have an account?</p>
          <Link to="/login" className="auth-footer-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;