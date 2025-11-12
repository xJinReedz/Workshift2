import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for database and API to be ready
    const initializePage = () => {
      // Check authentication on page load - exactly like original
      if (!window.api || !window.api.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      // Initialize dashboard exactly like original HTML
      // Use multiple timeouts to ensure DOM elements are rendered
      setTimeout(() => {
        try {
          if (window.initializeDashboard) {
            window.initializeDashboard();
          }
        } catch (error) {
          console.warn('Dashboard initialization error:', error);
        }
        
        setTimeout(() => {
          try {
            if (window.loadBoards) {
              window.loadBoards();
            }
          } catch (error) {
            console.warn('Load boards error:', error);
          }
        }, 200);
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
    }
  };

  const openProfileModal = () => {
    if (window.openProfileModal) {
      window.openProfileModal();
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
              <li><Link to="/" className="active">Boards</Link></li>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/inbox">Inbox</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
            
            <div className="navbar-actions">
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input type="text" className="search-input" placeholder="Search boards, cards, and more..." />
              </div>
              
              <button className="mobile-menu-toggle">
                <i className="fas fa-bars"></i>
              </button>
              
              <div className="profile-dropdown">
                <div className="profile-avatar" onClick={openProfileModal}>
                  LT
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-layout">
          <div className="dashboard-main">
            {/* Dashboard Header */}
            <div className="dashboard-header">
              <h1 className="dashboard-title">Your Boards</h1>
              <p className="dashboard-subtitle">Manage your projects and collaborate with your team</p>
            </div>

            {/* Boards Grid */}
            <div className="boards-grid" id="boards-grid">
              {/* Create New Board Tile */}
              <div className="board-tile create-new" onClick={() => openModal('create-board-modal')}>
                <div className="create-new-content">
                  <i className="fas fa-plus create-new-icon"></i>
                  <div className="create-new-text">Create New Board</div>
                </div>
              </div>

              {/* Boards will be loaded dynamically from database */}
            </div>
          </div>

          {/* Dashboard Sidebar */}
          <div className="dashboard-sidebar">
            {/* Starred Boards */}
            <div className="starred-boards">
              <h3><i className="fas fa-star"></i> Starred Boards</h3>
              <ul className="starred-list" id="starred-boards-list">
                {/* Starred boards will be loaded dynamically */}
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <ul className="activity-list">
                <li className="activity-item" onClick={() => window.location.href='index.html'}>
                  <div className="activity-avatar">
                    <div className="avatar avatar-sm" style={{background: '#61bd4f'}}>PR</div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>Paolo Rayos</strong> added a card to{' '}
                      <span className="activity-board">Mobile App Development</span>
                    </div>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                </li>
                <li className="activity-item" onClick={() => window.location.href='index.html'}>
                  <div className="activity-avatar">
                    <div className="avatar avatar-sm" style={{background: '#0079bf'}}>LT</div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>Luc Trevecedo</strong> completed a task in{' '}
                      <span className="activity-board">Website Redesign</span>
                    </div>
                    <div className="activity-time">4 hours ago</div>
                  </div>
                </li>
                <li className="activity-item" onClick={() => window.location.href='index.html'}>
                  <div className="activity-avatar">
                    <div className="avatar avatar-sm" style={{background: '#eb5a46'}}>NA</div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>Nathaniel Andrada</strong> commented on a card in{' '}
                      <span className="activity-board">Marketing Campaign Q1</span>
                    </div>
                    <div className="activity-time">1 day ago</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* All the original modals from the HTML */}
      {/* Create Board Modal */}
      <div id="create-board-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create New Board</h3>
            <button className="modal-close" onClick={() => window.closeModal && window.closeModal(document.getElementById('create-board-modal'))}>&times;</button>
          </div>
          <div className="modal-body">
            <form id="create-board-form">
              <div className="form-group">
                <label className="form-label">Board Title</label>
                <input type="text" className="form-input" placeholder="Enter board title..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea className="form-input" rows="3" placeholder="What's this board about?"></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Background</label>
                <div className="background-options" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #0079bf, #00c2e0)'}}></div>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #61bd4f, #51e5ff)'}}></div>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #f2d600, #ff9f1a)'}}></div>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #eb5a46, #ff6b6b)'}}></div>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #c377e0, #f093fb)'}}></div>
                  <div className="bg-option" style={{width: '60px', height: '40px', borderRadius: '4px', cursor: 'pointer', background: 'linear-gradient(135deg, #ff9f1a, #feca57)'}}></div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => window.closeModal && window.closeModal(document.getElementById('create-board-modal'))}>Cancel</button>
            <button type="submit" className="btn btn-primary" form="create-board-form">Create Board</button>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      <div id="template-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Choose Template</h3>
            <button className="modal-close" onClick={() => window.closeModal && window.closeModal(document.getElementById('template-modal'))}>&times;</button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-4">Start with a template to get your board set up quickly.</p>
            <div className="template-grid" style={{display: 'grid', gap: '1rem'}}>
              <div className="template-item">
                <div className="template-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="template-info">
                  <div className="template-name">Project Management</div>
                  <div className="template-description">Manage projects from start to finish with customizable workflows</div>
                </div>
              </div>
              <div className="template-item">
                <div className="template-icon">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <div className="template-info">
                  <div className="template-name">Marketing Campaign</div>
                  <div className="template-description">Plan and track marketing initiatives and campaigns</div>
                </div>
              </div>
              <div className="template-item">
                <div className="template-icon">
                  <i className="fas fa-code"></i>
                </div>
                <div className="template-info">
                  <div className="template-name">Software Development</div>
                  <div className="template-description">Agile development workflow with sprints and backlogs</div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => window.closeModal && window.closeModal(document.getElementById('template-modal'))}>Cancel</button>
            <button type="button" className="btn btn-primary">Use Template</button>
          </div>
        </div>
      </div>

      {/* Delete Board Confirmation Modal */}
      <div id="delete-board-modal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3><i className="fas fa-exclamation-triangle" style={{color: 'var(--danger-color)'}}></i> Delete Board</h3>
            <button className="modal-close" onClick={() => window.closeModal && window.closeModal(document.getElementById('delete-board-modal'))}>&times;</button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete the board <strong id="board-name-to-delete"></strong>?</p>
            <p style={{color: 'var(--danger-color)', fontSize: '0.875rem', marginTop: '1rem'}}>
              <i className="fas fa-info-circle"></i> This action cannot be undone. All lists and cards in this board will be permanently deleted.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => window.closeModal && window.closeModal(document.getElementById('delete-board-modal'))}>Cancel</button>
            <button type="button" className="btn btn-danger" id="confirm-delete-board" onClick={() => window.deleteBoard && window.deleteBoard()}>
              <i className="fas fa-trash"></i> Delete Board
            </button>
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      <div id="profile-menu" className="dropdown-menu" style={{position: 'absolute', top: '100%', right: '0', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)', minWidth: '200px', zIndex: '1000', opacity: '0', visibility: 'hidden', transform: 'translateY(-10px)', transition: 'var(--transition)'}}>
        <div style={{padding: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)'}}>
            <div className="avatar">LT</div>
            <div>
              <div style={{fontWeight: '600'}}>Luc Trevecedo</div>
              <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>luc@gmail.com</div>
            </div>
          </div>
          <ul style={{listStyle: 'none'}}>
            <li><a href="#" style={{display: 'block', padding: '0.5rem 0', color: 'var(--text-primary)', transition: 'var(--transition)'}}>Profile</a></li>
            <li><a href="#" style={{display: 'block', padding: '0.5rem 0', color: 'var(--text-primary)', transition: 'var(--transition)'}}>Settings</a></li>
            <li><a href="#" style={{display: 'block', padding: '0.5rem 0', color: 'var(--text-primary)', transition: 'var(--transition)'}}>Help</a></li>
            <li style={{borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem'}}>
              <a href="#" style={{display: 'block', padding: '0.5rem 0', color: 'var(--danger-color)', transition: 'var(--transition)'}}>Sign Out</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;