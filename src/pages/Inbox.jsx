import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Inbox = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = () => {
      // Check authentication on page load - exactly like original
      if (!window.api || !window.api.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      // Initialize inbox exactly like original HTML
      setTimeout(() => {
        try {
          if (window.initializeInbox) {
            window.initializeInbox();
          }
        } catch (error) {
          console.warn('Inbox initialization error:', error);
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

  const markAllAsRead = () => {
    if (window.markAllAsRead) {
      window.markAllAsRead();
    }
  };

  const filterNotifications = (filter) => {
    if (window.filterNotifications) {
      window.filterNotifications(filter);
    }
  };

  const toggleSetting = (element) => {
    if (window.toggleSetting) {
      window.toggleSetting(element);
    }
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
              <li><Link to="/inbox" className="active">Inbox</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
            
            <div className="navbar-actions">
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input type="text" className="search-input" placeholder="Search notifications..." />
              </div>
              
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
        <div className="inbox-container">
          {/* Inbox Header */}
          <div className="inbox-header">
            <h1 className="inbox-title">
              <i className="fas fa-inbox"></i>
              Inbox
              <span className="inbox-badge" id="unread-count">4</span>
            </h1>
            
            <div className="inbox-actions">
              <div className="inbox-filter">
                <button className="filter-btn active" data-filter="all">All</button>
                <button className="filter-btn" data-filter="unread">Unread</button>
                <button className="filter-btn" data-filter="mentions">Mentions</button>
              </div>
              
              <span className="mark-all-read" onClick={markAllAsRead}>Mark all as read</span>
            </div>
          </div>

          {/* Inbox Layout */}
          <div className="inbox-layout">
            <div className="inbox-main">
              {/* Notification List */}
              <div className="notification-list" id="notification-list">
                {/* Unread Notifications */}
                <div className="notification-item unread" data-type="mention" data-id="1">
                  <div className="notification-avatar">
                    <div className="avatar" style={{background: '#61bd4f'}}>PR</div>
                    <div className="notification-type-icon mention">
                      <i className="fas fa-at"></i>
                    </div>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">Paolo Rayos mentioned you</h4>
                      <span className="notification-time">2 hours ago</span>
                    </div>
                    <p className="notification-message">
                      <strong>@luc</strong> can you review the homepage mockups when you have a chance? I'd love to get your feedback on the new layout.
                    </p>
                    <div className="notification-context">
                      <i className="fas fa-credit-card"></i>
                      <span>in card "Homepage mockups" on</span>
                      <span className="notification-board">Website Redesign</span>
                    </div>
                    <div className="notification-actions">
                      <button className="notification-action primary">Reply</button>
                      <button className="notification-action">View Card</button>
                      <button className="notification-action">Mark as Read</button>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread" data-type="due-date" data-id="3">
                  <div className="notification-avatar">
                    <div className="avatar" style={{background: '#eb5a46'}}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="notification-type-icon due-date">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">Card due soon</h4>
                      <span className="notification-time">4 hours ago</span>
                    </div>
                    <p className="notification-message">
                      "Design system components" is due in 2 days (January 20, 2024). Make sure to complete all remaining tasks.
                    </p>
                    <div className="notification-context">
                      <i className="fas fa-credit-card"></i>
                      <span>in card "Design system components" on</span>
                      <span className="notification-board">Website Redesign</span>
                    </div>
                    <div className="notification-actions">
                      <button className="notification-action primary">Reply</button>
                      <button className="notification-action">View Card</button>
                      <button className="notification-action">Mark as Read</button>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread" data-type="comment" data-id="4">
                  <div className="notification-avatar">
                    <div className="avatar" style={{background: '#f2d600', color: '#333'}}>ES</div>
                    <div className="notification-type-icon comment">
                      <i className="fas fa-comment"></i>
                    </div>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">New comment on your card</h4>
                      <span className="notification-time">6 hours ago</span>
                    </div>
                    <p className="notification-message">
                      Elijah Sintor commented: "The wireframes look great! I have a few suggestions for the navigation layout. Can we schedule a quick call to discuss?"
                    </p>
                    <div className="notification-context">
                      <i className="fas fa-credit-card"></i>
                      <span>in card "Create wireframes for homepage" on</span>
                      <span className="notification-board">Website Redesign</span>
                    </div>
                    <div className="notification-actions">
                      <button className="notification-action primary">Reply</button>
                      <button className="notification-action">View Card</button>
                      <button className="notification-action">Mark as Read</button>
                    </div>
                  </div>
                </div>

                <div className="notification-item unread" data-type="board-update" data-id="5">
                  <div className="notification-avatar">
                    <div className="avatar" style={{background: '#c377e0'}}>AL</div>
                    <div className="notification-type-icon board-update">
                      <i className="fas fa-plus"></i>
                    </div>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">New card added to board</h4>
                      <span className="notification-time">8 hours ago</span>
                    </div>
                    <p className="notification-message">
                      Andrew Llego added "Set up CI/CD pipeline" to the "In Progress" list. This card has been assigned to the development team.
                    </p>
                    <div className="notification-context">
                      <i className="fas fa-th-large"></i>
                      <span>on board</span>
                      <span className="notification-board">Mobile App Development</span>
                    </div>
                    <div className="notification-actions">
                      <button className="notification-action primary">Reply</button>
                      <button className="notification-action">View Card</button>
                      <button className="notification-action">Mark as Read</button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Empty State (hidden by default) */}
              <div className="inbox-empty" id="inbox-empty" style={{display: 'none'}}>
                <div className="inbox-empty-icon">
                  <i className="fas fa-inbox"></i>
                </div>
                <h3 className="inbox-empty-title">All caught up!</h3>
                <p className="inbox-empty-message">
                  You have no new notifications.<br/>
                  We'll notify you when there's something new to see.
                </p>
              </div>
            </div>

            {/* Inbox Sidebar */}
            <div className="inbox-sidebar">
              {/* Quick Stats */}
              <div className="sidebar-section">
                <h3>Quick Stats</h3>
                <div className="quick-stats">
                  <div className="stat-item" onClick={() => filterNotifications('unread')}>
                    <div className="stat-label">
                      <i className="fas fa-envelope stat-icon"></i>
                      <span>Unread</span>
                    </div>
                    <div className="stat-value highlight">4</div>
                  </div>
                  <div className="stat-item" onClick={() => filterNotifications('mentions')}>
                    <div className="stat-label">
                      <i className="fas fa-at stat-icon"></i>
                      <span>Mentions</span>
                    </div>
                    <div className="stat-value">2</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">
                      <i className="fas fa-clock stat-icon"></i>
                      <span>Due Soon</span>
                    </div>
                    <div className="stat-value highlight">3</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="sidebar-section">
                <h3>Recent Activity</h3>
                <div className="recent-activity-list">
                  <div className="activity-item-small">
                    <div className="avatar avatar-sm" style={{background: '#61bd4f'}}>PR</div>
                    <div className="activity-content-small">
                      <div className="activity-text-small">Completed "User research analysis"</div>
                      <div className="activity-time-small">30 minutes ago</div>
                    </div>
                  </div>
                  <div className="activity-item-small">
                    <div className="avatar avatar-sm" style={{background: '#c377e0'}}>AL</div>
                    <div className="activity-content-small">
                      <div className="activity-text-small">Added comment to "API integration"</div>
                      <div className="activity-time-small">1 hour ago</div>
                    </div>
                  </div>
                  <div className="activity-item-small">
                    <div className="avatar avatar-sm" style={{background: '#f2d600', color: '#333'}}>ES</div>
                    <div className="activity-content-small">
                      <div className="activity-text-small">Moved card to "Review"</div>
                      <div className="activity-time-small">2 hours ago</div>
                    </div>
                  </div>
                  <div className="activity-item-small">
                    <div className="avatar avatar-sm" style={{background: '#c377e0'}}>TC</div>
                    <div className="activity-content-small">
                      <div className="activity-text-small">Created new board "Q2 Planning"</div>
                      <div className="activity-time-small">3 hours ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="sidebar-section">
                <h3>Notification Settings</h3>
                <div className="notification-settings">
                  <div className="setting-item">
                    <span className="setting-label">Email notifications</span>
                    <div className="setting-toggle active" onClick={(e) => toggleSetting(e.target)}></div>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Push notifications</span>
                    <div className="setting-toggle active" onClick={(e) => toggleSetting(e.target)}></div>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Mentions only</span>
                    <div className="setting-toggle" onClick={(e) => toggleSetting(e.target)}></div>
                  </div>
                  <div className="setting-item">
                    <span className="setting-label">Due date reminders</span>
                    <div className="setting-toggle active" onClick={(e) => toggleSetting(e.target)}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inbox;