import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const initializePage = () => {
      // Redirect if already authenticated
      if (window.api && window.api.isAuthenticated()) {
        navigate('/');
        return;
      }
      
      // Initialize login form - keeping original logic
      setTimeout(() => {
        if (window.initializeLoginForm) {
          window.initializeLoginForm();
        }
      }, 100);
      
      // Override the original login redirect to use React Router
      const originalHandleLogin = window.handleLogin;
      if (originalHandleLogin) {
        window.handleLogin = async function() {
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const remember = document.getElementById('remember').checked;
          const submitBtn = document.getElementById('login-btn');
          
          // Basic validation
          if (!email || !password) {
            window.showAuthError('Please fill in all fields');
            return;
          }
          
          if (!window.isValidEmail(email)) {
            window.showAuthError('Please enter a valid email address');
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
              
              window.showAuthSuccess('Login successful! Redirecting...');
              
              // Use React Router navigation instead of window.location
              setTimeout(() => {
                navigate('/');
              }, 1000);
            } else {
              window.showAuthError(result.message || 'Login failed');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Sign In';
              submitBtn.classList.remove('auth-loading');
            }
          } catch (error) {
            console.error('Login error:', error);
            window.showAuthError('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
            submitBtn.classList.remove('auth-loading');
          }
        };
      }
    };

    // If database is already loaded, initialize immediately
    if (window.db && window.api) {
      initializePage();
    } else {
      // Wait for database and API to be ready
      const checkReady = setInterval(() => {
        if (window.db && window.api) {
          clearInterval(checkReady);
          initializePage();
        }
      }, 100);
    }
  }, [navigate]);

  const handleSocialLogin = (provider) => {
    window.handleSocialLogin(provider);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
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

        <form className="auth-form" id="login-form">
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
                placeholder="Enter your password"
                required
                autoComplete="current-password"
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
          </div>

          <div className="auth-form-checkbox">
            <input type="checkbox" id="remember" name="remember" />
            <label htmlFor="remember">Remember me</label>
            <div style={{marginLeft: 'auto'}}>
              <a href="forgot-password.html">Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" id="login-btn">
            Sign In
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-login-btn google" onClick={() => handleSocialLogin('google')}>
            <i className="fab fa-google social-login-icon"></i>
            Continue with Google
          </button>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">Don't have an account?</p>
          <a href="register.html" className="auth-footer-link">Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;