// WorkShift - Shared JavaScript Functions

// Modern Notification System
function showToast(message, type = 'info', duration = 4000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
    
    return toast;
}

// Validation notification function
function showValidationError(message) {
    showToast(message, 'error', 5000);
}

function showSuccess(message) {
    showToast(message, 'success', 3000);
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize App
function initializeApp() {
    initializeMobileMenu();
    initializeModals();
    initializeDropdowns();
    initializeSearch();
    setActiveNavItem();
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navbarNav = document.querySelector('.navbar-nav');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Handle navbar navigation for pages without sidebar
            if (navbarNav) {
                navbarNav.classList.toggle('active');
                
                // Close navbar when clicking outside on mobile
                if (navbarNav.classList.contains('active')) {
                    document.addEventListener('click', closeNavOnOutsideClick);
                } else {
                    document.removeEventListener('click', closeNavOnOutsideClick);
                }
            }
            
            // Handle sidebar for pages that have it
            if (sidebar) {
                sidebar.classList.toggle('active');
                
                // Close sidebar when clicking outside on mobile
                if (sidebar.classList.contains('active')) {
                    document.addEventListener('click', closeSidebarOnOutsideClick);
                } else {
                    document.removeEventListener('click', closeSidebarOnOutsideClick);
                }
            }
        });
    }
    
    // Close navbar navigation when clicking outside
    function closeNavOnOutsideClick(e) {
        if (navbarNav && !navbarNav.contains(e.target) && !mobileToggle.contains(e.target)) {
            navbarNav.classList.remove('active');
            document.removeEventListener('click', closeNavOnOutsideClick);
        }
    }
    
    // Close sidebar when clicking outside (for pages that have sidebar)
    function closeSidebarOnOutsideClick(e) {
        if (sidebar && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove('active');
            document.removeEventListener('click', closeSidebarOnOutsideClick);
        }
    }
    
    // Close mobile menu when clicking on navigation links
    if (navbarNav) {
        navbarNav.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                navbarNav.classList.remove('active');
                document.removeEventListener('click', closeNavOnOutsideClick);
            }
        });
    }
    
    // Close mobile menu on window resize to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (navbarNav) {
                navbarNav.classList.remove('active');
                document.removeEventListener('click', closeNavOnOutsideClick);
            }
            if (sidebar) {
                sidebar.classList.remove('active');
                document.removeEventListener('click', closeSidebarOnOutsideClick);
            }
        }
    });
}

// Modal Functions
function initializeModals() {
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modal with close button
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Dropdown Functions
function initializeDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownId = this.getAttribute('data-dropdown');
            const dropdown = document.getElementById(dropdownId);
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                if (menu.id !== dropdownId) {
                    menu.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
}

function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (query.length > 0) {
        // Implement search logic here
        console.log('Searching for:', query);
        // You can add actual search functionality here
    }
}

// Set Active Navigation Item
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav a, .sidebar-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

function getTimeUntilDeadline(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    
    if (timeDiff <= 0) {
        return 'Overdue';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

function generateAvatar(name) {
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
    const colors = ['#0079bf', '#61bd4f', '#f2d600', '#eb5a46', '#00c2e0', '#c377e0', '#ff9f1a'];
    const color = colors[name.length % colors.length];
    
    return {
        initials: initials,
        color: color
    };
}

// Mark that the real notification system is available
window.hasRealNotificationSystem = true;

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1100;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-info { background: var(--info-color); }
            .notification-success { background: var(--success-color); }
            .notification-warning { background: var(--warning-color); color: var(--text-primary); }
            .notification-error { background: var(--danger-color); }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animation helpers
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Profile Modal Functions
function openProfileModal() {
    console.log('Profile avatar clicked!');
    
    // Create profile modal
    const modal = document.createElement('div');
    modal.className = 'modal profile-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-user"></i> Profile Settings</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="profile-section">
                    <div class="profile-avatar-large">LT</div>
                    <h3>Luc Trevecedo</h3>
                    <!-- Centered logout button below the name -->
                    <div style="margin-top:0.75rem; display:flex; justify-content:center;">
                        <button class="btn btn-secondary" id="profile-logout-btn" style="min-width:120px;">Logout</button>
                    </div>
                </div>
                
                <div class="profile-form">
                    <div class="form-group">
                        <label for="profile-name">Full Name</label>
                        <input type="text" id="profile-name" class="form-input" value="Luc Trevecedo" placeholder="Enter your full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-email">Email Address</label>
                        <input type="email" id="profile-email" class="form-input" value="luc@gmail.com" placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-current-password">Current Password</label>
                        <input type="password" id="profile-current-password" class="form-input" placeholder="Enter current password">
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-new-password">New Password</label>
                        <input type="password" id="profile-new-password" class="form-input" placeholder="Enter new password">
                    </div>
                    
                    <div class="form-group">
                        <label for="profile-confirm-password">Confirm New Password</label>
                        <input type="password" id="profile-confirm-password" class="form-input" placeholder="Confirm new password">
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button class="btn btn-primary" onclick="saveProfileChanges()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    // Wire logout button (added to modal) to the logout handler
    const logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            // close modal immediately
            const pm = document.querySelector('.profile-modal');
            if (pm) pm.remove();
            // Call logout
            if (typeof handleLogout === 'function') {
                await handleLogout();
            } else if (window.handleLogout) {
                await window.handleLogout();
            }
        });
    }
}

function saveProfileChanges() {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;
    const confirmPassword = document.getElementById('profile-confirm-password').value;
    
    // Basic validation
    if (!name.trim()) {
        showValidationError('Please enter your full name');
        return;
    }
    
    if (!email.trim()) {
        showValidationError('Please enter your email address');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showValidationError('New passwords do not match');
        return;
    }
    
    if (newPassword && !currentPassword) {
        showValidationError('Please enter your current password to change password');
        return;
    }
    
    // Simulate save success
    showSuccess('Profile updated successfully!');
    
    // Close modal
    document.querySelector('.profile-modal').remove();
    
    console.log('Profile changes:', { name, email, passwordChanged: !!newPassword });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Logout functionality
async function handleLogout() {
    try {
        const result = await window.api.logout();
        if (result.success) {
            // Redirect immediately to the React login route
            window.location.href = '/login';
        } else {
            showValidationError('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect to the React login route even if logout fails
        window.location.href = '/login';
    }
}

// Export functions for use in other scripts
window.WorkShift = {
    openModal,
    closeModal,
    showNotification,
    formatDate,
    formatDateTime,
    getTimeUntilDeadline,
    generateAvatar,
    fadeIn,
    fadeOut,
    openProfileModal,
    saveProfileChanges,
    showToast,
    showValidationError,
    showSuccess,
    handleLogout
};

// Make functions globally available
window.handleLogout = handleLogout;
window.showNotification = showNotification;
window.openProfileModal = openProfileModal;
window.saveProfileChanges = saveProfileChanges;
