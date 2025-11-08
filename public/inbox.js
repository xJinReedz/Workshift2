// Inbox specific JavaScript

let currentFilter = 'all';
// let notifications = []; // Store notification data - will be used in future features

// Helper function for missing global functions
function showNotification(message, type) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Fallback to alert if no notification system is available
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    }
}

// Removed auto-initialization - React components will call these functions manually
// document.addEventListener('DOMContentLoaded', function() {
//     initializeInbox();
// });

function initializeInbox() {
    initializeFilters();
    initializeNotificationActions();
    initializeSearch();
    loadNotifications();
    updateUnreadCount();
    // updateInboxStats(); // Reserved for future inbox statistics feature
}

// Make function available globally
window.initializeInbox = initializeInbox;

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(filter);
            filterNotifications(filter);
        });
    });
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
}

function filterNotifications(filter) {
    const notificationItems = document.querySelectorAll('.notification-item');
    const emptyState = document.getElementById('inbox-empty');
    let visibleCount = 0;
    
    notificationItems.forEach(item => {
        let shouldShow = false;
        
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'unread':
                shouldShow = item.classList.contains('unread');
                break;
            case 'mentions':
                shouldShow = item.getAttribute('data-type') === 'mention';
                break;
            case 'assignments':
                shouldShow = item.getAttribute('data-type') === 'assignment';
                break;
            default:
                shouldShow = true; // Default to showing all items
                break;
        }
        
        if (shouldShow) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show empty state if no notifications match filter
    if (visibleCount === 0) {
        emptyState.style.display = 'block';
        updateEmptyStateMessage(filter);
    } else {
        emptyState.style.display = 'none';
    }
}

function updateEmptyStateMessage(filter) {
    const emptyState = document.getElementById('inbox-empty');
    const title = emptyState.querySelector('.inbox-empty-title');
    const message = emptyState.querySelector('.inbox-empty-message');
    
    switch(filter) {
        case 'unread':
            title.textContent = 'No unread notifications';
            message.innerHTML = 'All caught up! You have no unread notifications.<br>Great job staying on top of things.';
            break;
        case 'mentions':
            title.textContent = 'No mentions';
            message.innerHTML = 'You have no new mentions.<br>We\'ll notify you when someone mentions you.';
            break;
        case 'assignments':
            title.textContent = 'No new assignments';
            message.innerHTML = 'You have no new task assignments.<br>Check back later for new work.';
            break;
        default:
            title.textContent = 'All caught up!';
            message.innerHTML = 'You have no new notifications.<br>We\'ll notify you when there\'s something new to see.';
    }
}

// Notification actions
function initializeNotificationActions() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notification-action')) {
            handleNotificationAction(e.target);
        }
        
        if (e.target.closest('.notification-item')) {
            handleNotificationClick(e.target.closest('.notification-item'));
        }
    });
}

function handleNotificationAction(button) {
    const action = button.textContent.toLowerCase().trim();
    const notificationItem = button.closest('.notification-item');
    const notificationId = notificationItem.getAttribute('data-id');
    
    switch(action) {
        case 'mark as read':
            markAsRead(notificationItem);
            break;
        case 'reply':
            openReplyModal(notificationId);
            break;
        case 'view card':
            viewCard(notificationId);
            break;
        default:
            console.log(`Action: ${action} for notification ${notificationId}`);
    }
}

function handleNotificationClick(notificationItem, event) {
    // Mark as read when clicked (unless clicking on action buttons)
    if (event && !event.target.classList.contains('notification-action')) {
        markAsRead(notificationItem);
    }
}

function markAsRead(notificationItem) {
    if (notificationItem.classList.contains('unread')) {
        notificationItem.classList.remove('unread');
        
        // Remove mark as read button
        const markAsReadBtn = notificationItem.querySelector('.notification-action:last-child');
        if (markAsReadBtn && markAsReadBtn.textContent.trim() === 'Mark as Read') {
            markAsReadBtn.remove();
        }
        
        updateUnreadCount();
        showNotification('Notification marked as read', 'success');
    }
}

function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    
    unreadNotifications.forEach(item => {
        item.classList.remove('unread');
        
        // Remove mark as read buttons
        const markAsReadBtn = item.querySelector('.notification-action:last-child');
        if (markAsReadBtn && markAsReadBtn.textContent.trim() === 'Mark as Read') {
            markAsReadBtn.remove();
        }
    });
    
    updateUnreadCount();
    showNotification(`Marked ${unreadNotifications.length} notifications as read`, 'success');
}

// Make function available globally
window.markAllAsRead = markAllAsRead;

function updateUnreadCount() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.getElementById('unread-count');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
    
    // Update stats in sidebar
    const unreadStat = document.querySelector('.stat-item .stat-value.highlight');
    if (unreadStat) {
        unreadStat.textContent = unreadCount;
        if (unreadCount === 0) {
            unreadStat.classList.remove('highlight');
        }
    }
}

// Modal actions
function openReplyModal(notificationId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reply to Comment</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Your Reply</label>
                    <textarea class="form-input" rows="4" placeholder="Write your reply..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="sendReply('${notificationId}', this)">Send Reply</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // Focus on textarea
    const textarea = modal.querySelector('textarea');
    textarea.focus();
}

function sendReply(notificationId, button) {
    const modal = button.closest('.modal');
    const textarea = modal.querySelector('textarea');
    const reply = textarea.value.trim();
    
    if (!reply) {
        showNotification('Please enter a reply', 'error');
        return;
    }
    
    // Simulate sending reply
    setTimeout(() => {
        modal.remove();
        showNotification('Reply sent successfully!', 'success');
        
        // Add a new notification for the reply
        addNewNotification({
            type: 'comment',
            title: 'Reply sent',
            message: `Your reply "${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}" was sent successfully.`,
            time: 'just now',
            avatar: 'LT',
            avatarColor: '#0079bf'
        });
    }, 1000);
}

// Make function available globally
window.sendReply = sendReply;

function viewCard(notificationId) {
    showNotification('Redirecting to card...', 'info');
    setTimeout(() => {
        window.location.href = 'http://localhost/workshift2/board.php?id=4';
    }, 500);
}

function viewBoard(notificationId) {
    showNotification('Redirecting to board...', 'info');
    setTimeout(() => {
        window.location.href = 'board.php';
    }, 1000);
}

// Make function available globally
window.viewBoard = viewBoard;

function extendDueDate(notificationId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Extend Due Date</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">New Due Date</label>
                    <input type="date" class="form-input" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label class="form-label">Reason (Optional)</label>
                    <textarea class="form-input" rows="3" placeholder="Why are you extending the due date?"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="updateDueDate('${notificationId}', this)">Update Due Date</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

// Make function available globally
window.extendDueDate = extendDueDate;

function updateDueDate(notificationId, button) {
    const modal = button.closest('.modal');
    const dateInput = modal.querySelector('input[type="date"]');
    const newDate = dateInput.value;
    
    if (!newDate) {
        showNotification('Please select a new due date', 'error');
        return;
    }
    
    modal.remove();
    showNotification('Due date updated successfully!', 'success');
    
    // Mark the notification as read
    const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
    if (notificationItem) {
        markAsRead(notificationItem);
    }
}

// Make function available globally
window.updateDueDate = updateDueDate;

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleInboxSearch, 300));
    }
}

function handleInboxSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.toLowerCase().trim();
    const notificationItems = document.querySelectorAll('.notification-item');
    
    if (!query) {
        // Show all notifications based on current filter
        filterNotifications(currentFilter);
        return;
    }
    
    let visibleCount = 0;
    
    notificationItems.forEach(item => {
        const title = item.querySelector('.notification-title').textContent.toLowerCase();
        const message = item.querySelector('.notification-message').textContent.toLowerCase();
        const board = item.querySelector('.notification-board')?.textContent.toLowerCase() || '';
        
        if (title.includes(query) || message.includes(query) || board.includes(query)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show empty state if no results
    const emptyState = document.getElementById('inbox-empty');
    if (visibleCount === 0) {
        emptyState.style.display = 'block';
        emptyState.querySelector('.inbox-empty-title').textContent = 'No results found';
        emptyState.querySelector('.inbox-empty-message').innerHTML = `No notifications match "${query}".<br>Try a different search term.`;
    } else {
        emptyState.style.display = 'none';
    }
}

// Settings toggle
function toggleSetting(toggle) {
    toggle.classList.toggle('active');
    const label = toggle.previousElementSibling.textContent;
    const isActive = toggle.classList.contains('active');
    
    showNotification(`${label} ${isActive ? 'enabled' : 'disabled'}`, 'success');
}

// Make function available globally
window.toggleSetting = toggleSetting;

// Load notifications (simulate API call)
function loadNotifications() {
    // This would normally fetch from an API
    // const notificationElements = Array.from(document.querySelectorAll('.notification-item')).map(item => ({
    //     id: item.getAttribute('data-id'),
    //     type: item.getAttribute('data-type'),
    //     unread: item.classList.contains('unread'),
    //     element: item
    // }));
    
    // Store for future use
    // notifications = notificationElements; // Reserved for future notification management
}

// Real-time updates simulation
function startRealTimeUpdates() {
    // Simulate receiving new notifications every 30 seconds
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance
            addRandomNotification();
        }
    }, 30000);
}

function addRandomNotification() {
    // Check if we're on the inbox page and DOM elements exist
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) {
        return; // Exit if not on inbox page
    }
    
    const notificationTypes = [
        {
            type: 'mention',
            title: 'Sarah Miller mentioned you',
            message: '@john could you take a look at this when you have a moment?',
            icon: 'fas fa-at',
            avatar: 'SM',
            avatarColor: '#61bd4f',
            time: 'just now'
        },
        {
            type: 'assignment',
            title: 'You were assigned to a card',
            message: 'Alice Lee assigned you to "Review API documentation"',
            icon: 'fas fa-user-plus',
            avatar: 'AL',
            avatarColor: '#f2d600',
            time: 'just now'
        },
        {
            type: 'comment',
            title: 'New comment on your card',
            message: 'Mike Johnson commented: "This looks good to me, ready for testing!"',
            icon: 'fas fa-comment',
            avatar: 'MJ',
            avatarColor: '#eb5a46',
            time: 'just now'
        }
    ];
    
    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    addNewNotification(randomNotification);
}

function addNewNotification(notificationData) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) {
        return; // Exit if not on inbox page
    }
    
    const newNotification = document.createElement('div');
    newNotification.className = 'notification-item unread';
    newNotification.setAttribute('data-type', notificationData.type);
    newNotification.setAttribute('data-id', Date.now().toString());
    
    newNotification.innerHTML = `
        <div class="notification-avatar">
            <div class="avatar" style="background: ${notificationData.avatarColor}; ${notificationData.avatarColor === '#f2d600' ? 'color: #333;' : ''}">${notificationData.avatar}</div>
            <div class="notification-type-icon ${notificationData.type}">
                <i class="${notificationData.icon}"></i>
            </div>
        </div>
        <div class="notification-content">
            <div class="notification-header">
                <h4 class="notification-title">${notificationData.title}</h4>
                <span class="notification-time">${notificationData.time || 'just now'}</span>
            </div>
            <p class="notification-message">${notificationData.message}</p>
            <div class="notification-context">
                <i class="fas fa-credit-card"></i>
                <span>in card "Sample Card" on</span>
                <span class="notification-board">Website Redesign</span>
            </div>
            <div class="notification-actions">
                <button class="notification-action primary">Reply</button>
                <button class="notification-action">View Card</button>
                <button class="notification-action">Mark as Read</button>
            </div>
        </div>
    `;
    
    // Add to top of list
    notificationList.insertBefore(newNotification, notificationList.firstChild);
    
    // Animate in
    newNotification.style.opacity = '0';
    newNotification.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        newNotification.style.transition = 'all 0.3s ease';
        newNotification.style.opacity = '1';
        newNotification.style.transform = 'translateY(0)';
    }, 100);
    
    // Update counts
    updateUnreadCount();
    
    // Show notification if function exists
    if (typeof showNotification === 'function') {
        showNotification('New notification received', 'info');
    }
    
    // Apply current filter
    setTimeout(() => {
        filterNotifications(currentFilter);
    }, 500);
}

// Make function available globally
window.startRealTimeUpdates = startRealTimeUpdates;

// Utility functions
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

// Keyboard shortcuts
// Removed auto-initialization - React components will call these functions manually
/*
document.addEventListener('keydown', function(e) {
    // Mark all as read with Shift+R
    if (e.shiftKey && e.key === 'R') {
        e.preventDefault();
        markAllAsRead();
    }
    
    // Filter shortcuts
    if (e.altKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                setActiveFilter('all');
                filterNotifications('all');
                break;
            case '2':
                e.preventDefault();
                setActiveFilter('unread');
                filterNotifications('unread');
                break;
            case '3':
                e.preventDefault();
                setActiveFilter('mentions');
                filterNotifications('mentions');
                break;
            case '4':
                e.preventDefault();
                setActiveFilter('assignments');
                filterNotifications('assignments');
                break;
        }
    }
});
*/

// Auto-refresh timestamps
setInterval(() => {
    const timeElements = document.querySelectorAll('.notification-time');
    timeElements.forEach(element => {
        // This would normally calculate relative time from actual timestamps
        // For demo purposes, we'll just update some randomly
        if (Math.random() < 0.1) {
            const currentText = element.textContent;
            if (currentText.includes('hours ago')) {
                const hours = parseInt(currentText);
                element.textContent = `${hours + 1} hours ago`;
            }
        }
    });
}, 60000); // Update every minute
