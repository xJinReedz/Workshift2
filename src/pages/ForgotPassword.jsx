import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = () => {
      // Redirect if already authenticated
      if (window.api && window.api.isAuthenticated()) {
        navigate('/');
        return;
      }
      
      // Initialize forgot password form - keeping original logic
      setTimeout(() => {
        if (window.initializeForgotPasswordForm) {
          window.initializeForgotPasswordForm();
        }
      }, 100);
      
      // Override the original forgot password redirect to use React Router
      const originalHandleForgotPassword = window.handleForgotPassword;
      if (originalHandleForgotPassword) {
        window.handleForgotPassword = function() {
          const email = document.getElementById('email').value;
          const submitBtn = document.getElementById('reset-btn');
          
          if (!email) {
            window.showAuthError('Please enter your email address');
            return;
          }
          
          if (!window.isValidEmail(email)) {
            window.showAuthError('Please enter a valid email address');
            return;
          }
          
          // Show loading state
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
          submitBtn.classList.add('auth-loading');
          
          // Simulate API call (as per original implementation)
          setTimeout(() => {
            window.showAuthSuccess('Password reset link sent! Check your email for instructions.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
            submitBtn.classList.remove('auth-loading');
          }, 2000);
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
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password</p>
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

        <form className="auth-form" id="forgot-password-form">
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

          <button type="submit" className="auth-submit-btn" id="reset-btn">
            Send Reset Link
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">Remember your password?</p>
          <Link to="/login" className="auth-footer-link">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;