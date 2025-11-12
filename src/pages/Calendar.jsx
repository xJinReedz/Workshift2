import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Calendar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const initializePage = () => {
      // Check authentication on page load - exactly like original
      if (!window.api || !window.api.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      // Initialize calendar exactly like original HTML
      setTimeout(() => {
        try {
          if (window.initializeCalendar) {
            window.initializeCalendar();
          }
          // Initialize Google sync functionality
          if (window.initializeGoogleSync) {
            window.initializeGoogleSync();
          }
        } catch (error) {
          console.warn('Calendar initialization error:', error);
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

  const openModal = (modalId) => {
    if (window.openModal) {
      window.openModal(modalId);
      
      // If this is the Google sync modal, ensure event listeners are attached
      if (modalId === 'google-sync-modal') {
        setTimeout(() => {
          if (window.attachGoogleSyncEventListeners) {
            window.attachGoogleSyncEventListeners();
          }
        }, 100);
      }
    }
  };

  const closeModal = (modal) => {
    if (window.closeModal) {
      window.closeModal(modal);
    }
  };

  const openProfileModal = () => {
    if (window.openProfileModal) {
      window.openProfileModal();
    }
  };

  const handleEventModalClose = () => {
    if (window.handleEventModalClose) {
      window.handleEventModalClose();
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
              <li><Link to="/calendar" className="active">Calendar</Link></li>
              <li><Link to="/inbox">Inbox</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
            
            <div className="navbar-actions">
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input type="text" className="search-input" placeholder="Search events..." />
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
        <div className="calendar-container">
          {/* Calendar Header */}
          <div className="calendar-header">
            <h1 className="calendar-title">Calendar</h1>
            
            <div className="calendar-nav">
              <button className="calendar-nav-btn" id="prev-btn">
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="calendar-period" id="calendar-period">October 2025</div>
              <button className="calendar-nav-btn" id="next-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <div className="calendar-view-toggle">
              <button className="view-toggle-btn active" data-view="monthly">Month</button>
              <button className="view-toggle-btn" data-view="weekly">Week</button>
              <button className="view-toggle-btn" data-view="daily">Day</button>
              <button className="view-toggle-btn mobile-only" data-view="agenda" style={{display: 'none'}}>List</button>
            </div>
          </div>

          {/* Monthly View */}
          <div className="monthly-view active" id="monthly-view">
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                <div className="weekday">Sun</div>
                <div className="weekday">Mon</div>
                <div className="weekday">Tue</div>
                <div className="weekday">Wed</div>
                <div className="weekday">Thu</div>
                <div className="weekday">Fri</div>
                <div className="weekday">Sat</div>
              </div>
              
              <div className="calendar-days" id="calendar-days">
                {/* Calendar days will be generated by JavaScript */}
              </div>
            </div>
          </div>

          {/* Weekly View */}
          <div className="weekly-view" id="weekly-view">
            <div className="weekly-header">
              <div className="time-column">Time</div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">15</div>
                <div className="weekly-day-name">Sun</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">16</div>
                <div className="weekly-day-name">Mon</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">17</div>
                <div className="weekly-day-name">Tue</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">18</div>
                <div className="weekly-day-name">Wed</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">19</div>
                <div className="weekly-day-name">Thu</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">20</div>
                <div className="weekly-day-name">Fri</div>
              </div>
              <div className="weekly-day-header">
                <div className="weekly-day-number">21</div>
                <div className="weekly-day-name">Sat</div>
              </div>
            </div>
            
            <div className="weekly-grid" id="weekly-grid">
              {/* Weekly grid will be generated by JavaScript */}
            </div>
          </div>

          {/* Daily View */}
          <div className="daily-view" id="daily-view">
            <div className="daily-header">
              <div className="daily-date">27</div>
              <div className="daily-day-name">Sunday, October 2025</div>
            </div>
            
            <div className="daily-schedule">
              <div className="daily-time-slot">
                <div className="daily-time">9:00 AM</div>
                <div className="daily-events">
                  {/* Events will be populated by JavaScript */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">10:00 AM</div>
                <div className="daily-events">
                  {/* Events will be populated by JavaScript */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">11:00 AM</div>
                <div className="daily-events">
                  {/* Empty time slot */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">12:00 PM</div>
                <div className="daily-events">
                  {/* Empty time slot */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">1:00 PM</div>
                <div className="daily-events">
                  {/* Empty time slot */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">2:00 PM</div>
                <div className="daily-events">
                  {/* Empty time slot */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">3:00 PM</div>
                <div className="daily-events">
                  {/* Events will be populated by JavaScript */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">4:00 PM</div>
                <div className="daily-events">
                  {/* Empty time slot */}
                </div>
              </div>
              
              <div className="daily-time-slot">
                <div className="daily-time">5:00 PM</div>
                <div className="daily-events">
                  <div className="daily-event">
                    <div className="daily-event-title">Website Launch Preparation</div>
                    <div className="daily-event-details">Final preparations for website redesign launch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda View (Mobile) */}
          <div className="agenda-view" id="agenda-view">
            <div className="agenda-item">
              <div className="agenda-date">Today - October 27, 2025</div>
              <div className="agenda-events">
                <div className="agenda-event">
                  <div className="agenda-event-time">9:00 AM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Website Launch Preparation</div>
                    <div className="agenda-event-description">Final preparations for website redesign launch</div>
                  </div>
                </div>
                
                <div className="agenda-event">
                  <div className="agenda-event-time">2:00 PM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Analytics Dashboard</div>
                    <div className="agenda-event-description">Deploy new analytics dashboard</div>
                  </div>
                </div>
                
                <div className="agenda-event">
                  <div className="agenda-event-time">5:00 PM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Website Launch Preparation</div>
                    <div className="agenda-event-description">Final preparations for website redesign launch</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="agenda-item">
              <div className="agenda-date">Tomorrow - October 28, 2025</div>
              <div className="agenda-events">
                <div className="agenda-event">
                  <div className="agenda-event-time">12:30 PM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Mobile App Beta Launch</div>
                    <div className="agenda-event-description">Launch beta version of mobile app to test users</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="agenda-item">
              <div className="agenda-date">Wednesday - October 29, 2025</div>
              <div className="agenda-events">
                <div className="agenda-event">
                  <div className="agenda-event-time">3:00 PM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Analytics Dashboard</div>
                    <div className="agenda-event-description">Deploy new analytics dashboard for stakeholders</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="agenda-item">
              <div className="agenda-date">Thursday - October 30, 2025</div>
              <div className="agenda-events">
                <div className="agenda-event">
                  <div className="agenda-event-time">11:00 AM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Content Calendar Q4</div>
                    <div className="agenda-event-description">Finalize content calendar for Q4 marketing</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="agenda-item">
              <div className="agenda-date">Friday - November 1, 2025</div>
              <div className="agenda-events">
                <div className="agenda-event">
                  <div className="agenda-event-time">8:00 AM</div>
                  <div className="agenda-event-content">
                    <div className="agenda-event-title">Website Redesign Launch</div>
                    <div className="agenda-event-description">Official launch of redesigned website</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Event Button */}
      <button className="add-event-btn" onClick={() => openModal('event-modal')}>
        <i className="fas fa-plus"></i>
      </button>

      {/* Google Calendar Sync Button */}
      <button className="google-sync-btn" onClick={() => openModal('google-sync-modal')} title="Sync with Google Calendar">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png?20221106121915" alt="Google Calendar" className="google-calendar-icon" />
      </button>

      {/* Event Modal */}
      <div id="event-modal" className="modal event-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Add New Event</h3>
            <button className="modal-close" onClick={() => {handleEventModalClose(); closeModal(document.getElementById('event-modal'));}}>&times;</button>
          </div>
          <div className="modal-body">
            <form className="event-form" id="event-form">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input type="text" className="form-input" placeholder="Enter event title..." required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Event description (optional)"></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input type="date" className="form-input" id="event-due-date" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Time</label>
                  <input type="time" className="form-input" id="event-due-time" required />
                </div>
              </div>
              <div id="event-deadline-validation-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '8px', display: 'none'}}></div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => {handleEventModalClose(); closeModal(document.getElementById('event-modal'));}}>Cancel</button>
            <button type="submit" className="btn btn-primary" form="event-form">Create Event</button>
          </div>
        </div>
      </div>

      {/* Google Calendar Sync Modal */}
      <div id="google-sync-modal" className="modal google-sync-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Google Calendar Sync</h3>
            <button className="modal-close" onClick={() => closeModal(document.getElementById('google-sync-modal'))}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="sync-status" id="sync-status">
              <div className="sync-info">
                <i className="fab fa-google sync-icon"></i>
                <p>Connect your Google Calendar to sync events between WorkShift and Google Calendar.</p>
              </div>
              
              <div className="sync-options" id="sync-options">
                {/* Sync options removed for simplified interface */}
              </div>
              
              <div className="sync-connected" id="sync-connected" style={{display: 'none'}}>
                <div className="connected-info">
                  <i className="fas fa-check-circle success-icon"></i>
                  <h4>Connected to Google Calendar</h4>
                  <p>Last sync: <span id="last-sync">Never</span></p>
                </div>
                
                <div className="sync-actions">
                  <button className="btn btn-primary toggle-btn" id="auto-sync-toggle">
                    <i className="fas fa-toggle-off"></i> Auto Sync: OFF
                  </button>
                  <button className="btn btn-secondary" id="disconnect-btn">
                    <i className="fas fa-unlink"></i> Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => closeModal(document.getElementById('google-sync-modal'))}>Cancel</button>
            <button type="button" className="btn btn-primary" id="connect-google-btn" onClick={() => window.connectToGoogle && window.connectToGoogle()}>
              <i className="fab fa-google"></i> Connect to Google
            </button>
            <button type="button" className="btn btn-primary" id="save-sync-settings" style={{display: 'none'}}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;