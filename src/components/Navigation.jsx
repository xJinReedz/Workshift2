import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = ({ onProfileClick }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <i className="fas fa-tasks"></i> WorkShift
          </Link>
          
          <ul className={`navbar-nav ${isMobileMenuOpen ? 'active' : ''}`}>
            <li>
              <Link 
                to="/" 
                className={isActivePage('/') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Boards
              </Link>
            </li>
            <li>
              <Link 
                to="/calendar" 
                className={isActivePage('/calendar') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Calendar
              </Link>
            </li>
            <li>
              <Link 
                to="/inbox" 
                className={isActivePage('/inbox') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Inbox
              </Link>
            </li>
            <li>
              <Link 
                to="/pricing" 
                className={isActivePage('/pricing') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
            </li>
          </ul>
          
          <div className="navbar-actions">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search boards, cards, and more..."
              />
            </div>
            
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              <i className="fas fa-bars" style={{color: '#172b4d', display: 'inline-block'}}></i>
              <span style={{display: 'none', fontSize: '24px', lineHeight: 1}}>☰</span>
            </button>
            
            <div className="profile-dropdown">
              <div className="profile-avatar" onClick={onProfileClick}>
                LT
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;