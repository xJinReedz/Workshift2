import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const initializePage = () => {
      // Check authentication on page load - exactly like original
      if (!window.api || !window.api.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      // Initialize pricing exactly like original HTML
      setTimeout(() => {
        try {
          if (window.initializePricing) {
            window.initializePricing();
          }
        } catch (error) {
          console.warn('Pricing initialization error:', error);
        }
      }, 100);
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

  const openProfileModal = () => {
    if (window.openProfileModal) {
      window.openProfileModal();
    }
  };

  const toggleBilling = () => {
    if (window.toggleBilling) {
      window.toggleBilling();
    }
  };

  const selectPlan = (plan) => {
    // Always use our custom logic, ignore window.selectPlan to prevent redirects
    // Show payment modal for the selected plan
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const selectedPlan = document.getElementById('selectedPlan');
    const selectedPrice = document.getElementById('selectedPrice');
    
    if (modal && modalTitle && selectedPlan && selectedPrice) {
      modalTitle.textContent = `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
      selectedPlan.textContent = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;
      
      // Set pricing based on plan
      const prices = { pro: '78', enterprise: '1359' };
      selectedPrice.textContent = prices[plan] || '78';
      
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  const handleSuccessfulUpgrade = (plan) => {
    setCurrentPlan(plan);
    setShowSuccessModal(true);
    closePaymentModal();
  };

  const toggleFaq = (element) => {
    if (window.toggleFaq) {
      window.toggleFaq(element);
    }
  };

  const closePaymentModal = () => {
    if (window.closePaymentModal) {
      window.closePaymentModal();
    } else {
      const modal = document.getElementById('paymentModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const processPayment = (event) => {
    event.preventDefault();
    
    // Always use our custom logic, ignore window.processPayment
    // Simulate payment process
    const selectedPlanElement = document.getElementById('selectedPlan');
    const planName = selectedPlanElement ? selectedPlanElement.textContent.replace(' Plan', '').toLowerCase() : 'pro';
    
    // Show loading state
    const submitButton = document.getElementById('submitPayment');
    if (submitButton) {
      const btnText = submitButton.querySelector('.btn-text');
      const btnLoader = submitButton.querySelector('.btn-loader');
      if (btnText && btnLoader) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
      }
      submitButton.disabled = true;
    }
    
    // Simulate processing time then show success
    setTimeout(() => {
      handleSuccessfulUpgrade(planName);
      
      // Reset button state
      if (submitButton) {
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoader = submitButton.querySelector('.btn-loader');
        if (btnText && btnLoader) {
          btnText.style.display = 'inline';
          btnLoader.style.display = 'none';
        }
        submitButton.disabled = false;
      }
    }, 1500);
  };

  const formatCardNumber = (input) => {
    if (window.formatCardNumber) {
      window.formatCardNumber(input);
    }
  };

  const formatExpiryDate = (input) => {
    if (window.formatExpiryDate) {
      window.formatExpiryDate(input);
    }
  };

  const formatCVV = (input) => {
    if (window.formatCVV) {
      window.formatCVV(input);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link to="/" className="navbar-brand">
              <i className="fas fa-tasks"></i> WorkShift
            </Link>
            
            <ul className="navbar-nav">
              <li><Link to="/">Boards</Link></li>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/inbox">Inbox</Link></li>
              <li><Link to="/pricing" className="active">Pricing</Link></li>
            </ul>
            
            <div className="navbar-actions">
              <button className="mobile-menu-toggle">
                <i className="fas fa-bars"></i>
              </button>
              
              <div className="profile-dropdown">
                <div className="profile-avatar" onClick={openProfileModal}>LT</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="pricing-container">
          {/* Pricing Header */}
          <div className="pricing-header">
            <h1 className="pricing-title">Choose the perfect plan for your team</h1>
            <p className="pricing-subtitle">
              Start with our free plan and upgrade as your team grows. All plans include our core features 
              with different limits and advanced capabilities.
            </p>
            
            {/* Billing Toggle */}
            <div className="pricing-toggle">
              <span className="pricing-toggle-label active" id="monthly-label">Monthly</span>
              <div className="pricing-switch" id="billing-toggle" onClick={toggleBilling}></div>
              <span className="pricing-toggle-label" id="yearly-label">
                Yearly
                <span className="pricing-discount">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="pricing-cards">
            {/* Basic Plan */}
            <div className="pricing-card" data-plan="basic">
              <div className="pricing-card-header">
                <div className="pricing-card-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <h3 className="pricing-card-name">Basic</h3>
                <p className="pricing-card-description">Allows up to three boards with unlimited cards and lists, basic collaboration for two collaborators per board, and file uploads up to 10 MB.</p>
              </div>
              
              <div className="pricing-card-price">
                <div className="pricing-price">
                  <span className="pricing-currency">₱</span>
                  <span className="pricing-amount" id="basic-price">0</span>
                  <span className="pricing-period">/month</span>
                </div>
                <div className="pricing-billing" id="basic-billing">Free forever</div>
              </div>
              
              <div className="pricing-card-features">
                <ul className="pricing-features-list">
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Up to 3 boards</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Unlimited cards and lists</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">2 collaborators per board</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">File uploads up to 10 MB</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Basic collaboration</span>
                  </li>
                </ul>
              </div>
              
              <div className="pricing-card-cta">
                {currentPlan === 'basic' ? (
                  <>
                    <button className="pricing-cta-btn current">Current Plan</button>
                    <p className="pricing-cta-note">You're currently on the Basic plan</p>
                  </>
                ) : (
                  <>
                    <button className="pricing-cta-btn secondary" onClick={() => selectPlan('basic')}>Downgrade to Basic</button>
                    <p className="pricing-cta-note">Switch back to the free plan</p>
                  </>
                )}
              </div>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="pricing-card featured" data-plan="pro">
              <div className="pricing-card-header">
                <div className="pricing-card-icon">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="pricing-card-name">Pro</h3>
                <p className="pricing-card-description">Unlimited boards, advanced collaboration tools, larger file uploads, customizations, reminders, calendar view, and app integrations for small to medium teams.</p>
              </div>
              
              <div className="pricing-card-price">
                <div className="pricing-price">
                  <span className="pricing-original" id="pro-original" style={{display: 'none'}}>₱98</span>
                  <span className="pricing-currency">₱</span>
                  <span className="pricing-amount" id="pro-price">78</span>
                  <span className="pricing-period">/month</span>
                </div>
                <div className="pricing-billing" id="pro-billing">per user, billed monthly</div>
              </div>
              
              <div className="pricing-card-features">
                <ul className="pricing-features-list">
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Unlimited boards</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Advanced collaboration tools</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Larger file uploads</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Customizations</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Reminders</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Calendar view</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">App integrations</span>
                  </li>
                </ul>
              </div>
              
              <div className="pricing-card-cta">
                {currentPlan === 'pro' ? (
                  <>
                    <button className="pricing-cta-btn current">Current Plan</button>
                    <p className="pricing-cta-note">You're currently on the Pro plan</p>
                  </>
                ) : (
                  <>
                    <button className="pricing-cta-btn primary" onClick={() => selectPlan('pro')}>
                      {currentPlan === 'basic' ? 'Upgrade to Pro' : 'Switch to Pro'}
                    </button>
                    <p className="pricing-cta-note">14-day free trial, no credit card required</p>
                  </>
                )}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card" data-plan="enterprise">
              <div className="pricing-card-header">
                <div className="pricing-card-icon">
                  <i className="fas fa-building"></i>
                </div>
                <h3 className="pricing-card-name">Enterprise</h3>
                <p className="pricing-card-description">Organization-wide management with advanced permissions, custom security policies, centralized billing, and dedicated onboarding to streamline productivity across all departments.</p>
              </div>
              
              <div className="pricing-card-price">
                <div className="pricing-price">
                  <span className="pricing-original" id="enterprise-original" style={{display: 'none'}}>₱1639</span>
                  <span className="pricing-currency">₱</span>
                  <span className="pricing-amount" id="enterprise-price">1359</span>
                  <span className="pricing-period">/month</span>
                </div>
                <div className="pricing-billing" id="enterprise-billing">per user, billed monthly</div>
              </div>
              
              <div className="pricing-card-features">
                <ul className="pricing-features-list">
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Everything in Pro</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Organization-wide management</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Advanced permissions</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Custom security policies</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Centralized billing</span>
                  </li>
                  <li className="pricing-feature included">
                    <div className="pricing-feature-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <span className="pricing-feature-text">Dedicated onboarding</span>
                  </li>
                </ul>
              </div>
              
              <div className="pricing-card-cta">
                {currentPlan === 'enterprise' ? (
                  <>
                    <button className="pricing-cta-btn current">Current Plan</button>
                    <p className="pricing-cta-note">You're currently on the Enterprise plan</p>
                  </>
                ) : (
                  <>
                    <button className="pricing-cta-btn secondary" onClick={() => selectPlan('enterprise')}>
                      {currentPlan === 'basic' ? 'Upgrade to Enterprise' : 'Switch to Enterprise'}
                    </button>
                    <p className="pricing-cta-note">14-day free trial, no credit card required</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pricing-faq">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <button className="faq-question" onClick={(e) => toggleFaq(e.target)}>
                  <span>Can I change my plan at any time?</span>
                  <i className="fas fa-chevron-down faq-question-icon"></i>
                </button>
                <div className="faq-answer">
                  <p className="faq-answer-text">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                    and we'll prorate any billing adjustments on your next invoice.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <button className="faq-question" onClick={(e) => toggleFaq(e.target)}>
                  <span>Is there a free trial available?</span>
                  <i className="fas fa-chevron-down faq-question-icon"></i>
                </button>
                <div className="faq-answer">
                  <p className="faq-answer-text">
                    Yes! We offer a 14-day free trial for both Pro and Enterprise plans. No credit card required. 
                    You can start your trial at any time and explore all the features.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <button className="faq-question" onClick={(e) => toggleFaq(e.target)}>
                  <span>What payment methods do you accept?</span>
                  <i className="fas fa-chevron-down faq-question-icon"></i>
                </button>
                <div className="faq-answer">
                  <p className="faq-answer-text">
                    We accept all major credit cards (Visa, MasterCard, American Express), PayPal, 
                    and bank transfers for Enterprise customers. All payments are processed securely.
                  </p>
                </div>
              </div>

              <div className="faq-item">
                <button className="faq-question" onClick={(e) => toggleFaq(e.target)}>
                  <span>What kind of support do you provide?</span>
                  <i className="fas fa-chevron-down faq-question-icon"></i>
                </button>
                <div className="faq-answer">
                  <p className="faq-answer-text">
                    Support varies by plan: Basic users get email support, Pro users get priority email support, 
                    and Enterprise users get 24/7 phone support plus a dedicated account manager.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <div className="modal-overlay" id="paymentModal" style={{display: 'none'}}>
        <div className="modal-container payment-modal">
          <div className="modal-header">
            <h3 className="modal-title" id="modalTitle">Upgrade to Pro</h3>
            <button className="modal-close" onClick={closePaymentModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="modal-body">
            {/* Plan Summary */}
            <div className="plan-summary">
              <div className="plan-info">
                <h4 id="selectedPlan">Pro Plan</h4>
                <div className="plan-price">
                  <span className="price-amount" id="selectedPrice">₱78</span>
                  <span className="price-period">/month per user</span>
                </div>
              </div>
              <div className="plan-features">
                <p className="trial-info">
                  <i className="fas fa-gift"></i>
                  14-day free trial, then ₱<span id="monthlyPrice">78</span>/month
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <form className="payment-form" id="paymentForm" onSubmit={processPayment}>
              {/* Payment Method */}
              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`} style={{cursor: 'pointer'}}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card" 
                      checked={paymentMethod === 'card'}
                      onChange={() => handlePaymentMethodChange('card')}
                    />
                    <div className="payment-option-content">
                      <i className="fas fa-credit-card"></i>
                      <span>Credit/Debit Card</span>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`} style={{cursor: 'pointer'}}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="paypal" 
                      checked={paymentMethod === 'paypal'}
                      onChange={() => handlePaymentMethodChange('paypal')}
                    />
                    <div className="payment-option-content">
                      <i className="fab fa-paypal"></i>
                      <span>PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="card-details" id="cardDetails">
                  <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="card-input-container">
                    <input type="text" id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" 
                           maxLength="19" onInput={(e) => formatCardNumber(e.target)} />
                    <div className="card-icons">
                      <i className="fab fa-cc-visa"></i>
                      <i className="fab fa-cc-mastercard"></i>
                      <i className="fab fa-cc-amex"></i>
                    </div>
                  </div>
                  <span className="error-message" id="cardNumberError"></span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" 
                           maxLength="5" onInput={(e) => formatExpiryDate(e.target)} />
                    <span className="error-message" id="expiryError"></span>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input type="text" id="cvv" name="cvv" placeholder="123" 
                           maxLength="4" onInput={(e) => formatCVV(e.target)} />
                    <span className="error-message" id="cvvError"></span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardName">Cardholder Name</label>
                  <input type="text" id="cardName" name="cardName" placeholder="John Doe" />
                  <span className="error-message" id="cardNameError"></span>
                </div>
                </div>
              )}

              {/* PayPal Option */}
              {paymentMethod === 'paypal' && (
                <div className="paypal-details">
                  <div className="paypal-info">
                    <p>You will be redirected to PayPal to complete your payment securely.</p>
                  </div>
                </div>
              )}

              {/* Billing Information */}
              <div className="billing-info">
                <h4>Billing Information</h4>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" />
                  <span className="error-message" id="emailError"></span>
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <select id="country" name="country">
                    <option value="">Select Country</option>
                    <option value="PH" defaultSelected>Philippines</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                  <span className="error-message" id="countryError"></span>
                </div>
              </div>

              {/* Terms */}
              <div className="terms-section">
                <label className="checkbox-label">
                  <input type="checkbox" id="agreeTerms" name="agreeTerms" />
                  <span className="checkbox-text">
                    I agree to the <a href="/terms" className="terms-link">Terms of Service</a> and{' '}
                    <a href="/privacy" className="terms-link">Privacy Policy</a>
                  </span>
                </label>
                <span className="error-message" id="termsError"></span>
              </div>

              {/* Security Notice */}
              <div className="security-notice">
                <i className="fas fa-shield-alt"></i>
                <span>Your payment information is secure and encrypted</span>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closePaymentModal}>Cancel</button>
            <button type="submit" form="paymentForm" className="btn-primary" id="submitPayment">
              <span className="btn-text">Start Free Trial</span>
              <span className="btn-loader" style={{display: 'none'}}>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{display: 'flex'}}>
          <div className="modal-container success-modal">
            <div className="modal-header">
              <h3 className="modal-title">🎉 Upgrade Successful!</h3>
              <button className="modal-close" onClick={closeSuccessModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="success-content">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4>Welcome to {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}!</h4>
                <p>
                  Your account has been successfully upgraded to the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan. 
                  You now have access to all the premium features and your 14-day free trial has started.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => navigate('/')}>
                Go to Dashboard
              </button>
              <button className="btn-secondary" onClick={closeSuccessModal}>
                Stay on Pricing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;