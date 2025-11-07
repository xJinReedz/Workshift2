// Dashboard specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadBoards(); // Load boards from database
});

function initializeDashboard() {
    initializeBackgroundSelection();
    initializeCreateBoardForm();
    initializeTemplateSelection();
    initializeProfileDropdown();
    updateRecentActivity();
}

// Load boards from database
async function loadBoards() {
    try {
        const result = await window.api.getBoards();
        
        if (result.success) {
            const boards = Array.isArray(result.data?.boards) ? result.data.boards : [];
            renderBoards(boards);
        } else {
            showNotification('Failed to load boards', 'error');
        }
    } catch (error) {
        console.error('Error loading boards:', error);
        showNotification('Error loading boards', 'error');
    }
}

// Render boards to the grid
function renderBoards(boards) {
    const boardsGrid = document.getElementById('boards-grid');
    const createNewTile = boardsGrid.querySelector('.board-tile.create-new');
    
    // Clear existing boards (except create new tile)
    const existingBoards = boardsGrid.querySelectorAll('.board-tile:not(.create-new)');
    existingBoards.forEach(board => board.remove());
    
    // Render each board
    boards.forEach((board, index) => {
        const boardTile = createBoardTile(board, index);
        boardsGrid.insertBefore(boardTile, createNewTile);
    });
    
    // Update starred boards sidebar
    updateStarredBoardsSidebar(boards);
}

// Update starred boards sidebar
function updateStarredBoardsSidebar(boards) {
    const starredList = document.getElementById('starred-boards-list');
    if (!starredList) return;
    
    starredList.innerHTML = '';
    
    const starredBoards = boards.filter(board => board.is_starred);
    
    if (starredBoards.length === 0) {
        starredList.innerHTML = '<li style="padding: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">No starred boards yet</li>';
        return;
    }
    
    starredBoards.forEach(board => {
        const li = document.createElement('li');
        li.className = 'starred-item';
        li.onclick = () => window.location.href = `board.html?id=${board.id}`;
        
        li.innerHTML = `
            <div class="starred-color" style="background: ${board.background_color};"></div>
            <span class="starred-name">${escapeHtml(board.title)}</span>
        `;
        
        starredList.appendChild(li);
    });
}

// Create a board tile element
function createBoardTile(board, index) {
    const tile = document.createElement('div');
    tile.className = 'board-tile';
    tile.onclick = () => window.location.href = `board.html?id=${board.id}`;
    
    // Map background colors to their corresponding gradients
    const colorToGradient = {
        '#0079bf': 'linear-gradient(135deg, #0079bf, #00c2e0)',
        '#61bd4f': 'linear-gradient(135deg, #61bd4f, #51e5ff)',
        '#f2d600': 'linear-gradient(135deg, #f2d600, #ff9f1a)',
        '#eb5a46': 'linear-gradient(135deg, #eb5a46, #ff6b6b)',
        '#c377e0': 'linear-gradient(135deg, #c377e0, #f093fb)',
        '#ff9f1a': 'linear-gradient(135deg, #ff9f1a, #feca57)'
    };
    
    // Use the actual background color from database, or fallback to index-based class
    let backgroundStyle = '';
    if (board.background_color && colorToGradient[board.background_color]) {
        backgroundStyle = `style="background: ${colorToGradient[board.background_color]};"`;
    } else {
        // Fallback to CSS classes if color doesn't match or isn't set
        const bgClasses = ['bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5', 'bg-6'];
        const bgClass = bgClasses[index % bgClasses.length];
        backgroundStyle = `class="${bgClass}"`;
    }
    
    tile.innerHTML = `
        <div class="board-background" ${backgroundStyle}>
            <div class="board-actions">
                <button class="board-star ${board.is_starred ? 'starred' : ''}" 
                        onclick="event.stopPropagation(); toggleStar(this, ${board.id})" 
                        data-board-id="${board.id}">
                    <i class="fa${board.is_starred ? 's' : 'r'} fa-star"></i>
                </button>
                <button class="board-delete" 
                        onclick="event.stopPropagation(); confirmDeleteBoard(${board.id}, '${escapeHtml(board.title).replace(/'/g, "\\'")}')" 
                        data-board-id="${board.id}" 
                        title="Delete Board">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="board-content">
            <h3 class="board-title">${escapeHtml(board.title)}</h3>
            <p class="board-description">${escapeHtml(board.description || 'No description')}</p>
            <div class="board-meta">
                <div class="board-stats">
                    <div class="board-stat">
                        <i class="fas fa-list"></i>
                        <span>${board.list_count || 0} lists</span>
                    </div>
                    <div class="board-stat">
                        <i class="fas fa-tasks"></i>
                        <span>${board.card_count || 0} cards</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return tile;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Background selection for create board modal
function initializeBackgroundSelection() {
    const bgOptions = document.querySelectorAll('.bg-option');
    
    // Initialize the selected index
    window.selectedBackgroundIndex = 0;
    
    bgOptions.forEach((option, index) => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            bgOptions.forEach(opt => {
                opt.style.border = 'none';
                opt.classList.remove('selected');
            });
            
            // Add selection to clicked option
            this.style.border = '3px solid #0079bf'; // Use actual color instead of CSS variable
            this.classList.add('selected');
            
            // Store the selected index
            window.selectedBackgroundIndex = index;
        });
    });
    
    // Select first option by default
    if (bgOptions.length > 0) {
        bgOptions[0].click();
    }
}

// Create board form handling
function initializeCreateBoardForm() {
    const form = document.getElementById('create-board-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateBoard();
        });
    }
}

async function handleCreateBoard() {
    const titleInput = document.querySelector('#create-board-form input[type="text"]');
    const descriptionInput = document.querySelector('#create-board-form textarea');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!title) {
        showNotification('Please enter a board title', 'error');
        return;
    }
    
    // Get background color from selected option using stored index
    const bgColors = ['#0079bf', '#61bd4f', '#f2d600', '#eb5a46', '#c377e0', '#ff9f1a'];
    const bgIndex = window.selectedBackgroundIndex || 0;
    const background_color = bgColors[bgIndex] || '#0079bf';
    
    try {
        const result = await window.api.createBoard({
            title: title,
            description: description,
            background_color: background_color,
            visibility: 'team'
        });
        
        if (result.success) {
            showNotification('Board created successfully!', 'success');
            
            // Close modal and reset form
            closeModal(document.getElementById('create-board-modal'));
            titleInput.value = '';
            descriptionInput.value = '';
            
            // Reset background selection
            document.querySelectorAll('.bg-option').forEach(opt => {
                opt.style.border = 'none';
                opt.classList.remove('selected');
            });
            document.querySelectorAll('.bg-option')[0].click(); // Select first option again
            
            // Reload boards
            loadBoards();
        } else {
            showNotification(result.message || 'Failed to create board', 'error');
        }
    } catch (error) {
        console.error('Error creating board:', error);
        showNotification('Error creating board', 'error');
    }
}

// Template selection
function initializeTemplateSelection() {
    const templateItems = document.querySelectorAll('#template-modal .template-item');
    let selectedTemplate = null;
    
    templateItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove selection from all templates
            templateItems.forEach(t => t.style.borderColor = 'var(--border-color)');
            
            // Add selection to clicked template
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'rgba(0, 121, 191, 0.05)';
            
            selectedTemplate = this.querySelector('.template-name').textContent;
        });
    });
}

// Star/Unstar boards
async function toggleStar(button, boardId) {
    const icon = button.querySelector('i');
    const isStarred = button.classList.contains('starred');
    
    try {
        const result = await window.api.updateBoard({
            board_id: boardId,
            is_starred: !isStarred
        });
        
        if (result.success) {
            if (isStarred) {
                button.classList.remove('starred');
                icon.className = 'far fa-star';
                showNotification('Removed from starred boards', 'info');
            } else {
                button.classList.add('starred');
                icon.className = 'fas fa-star';
                showNotification('Added to starred boards', 'success');
            }
            
            // Reload boards to update sidebar
            loadBoards();
        } else {
            showNotification(result.message || 'Failed to update board', 'error');
        }
    } catch (error) {
        console.error('Error toggling star:', error);
        showNotification('Error updating board', 'error');
    }
}

// Profile dropdown
function initializeProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileMenu = document.getElementById('profile-menu');
    
    if (profileDropdown && profileMenu) {
        // Position dropdown
        profileDropdown.style.position = 'relative';
        
        // Show/hide dropdown
        profileDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = profileMenu.classList.contains('active');
            
            if (isActive) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
                profileMenu.style.transform = 'translateY(-10px)';
                profileMenu.classList.remove('active');
            } else {
                profileMenu.style.opacity = '1';
                profileMenu.style.visibility = 'visible';
                profileMenu.style.transform = 'translateY(0)';
                profileMenu.classList.add('active');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (profileMenu.classList.contains('active')) {
                profileMenu.style.opacity = '0';
                profileMenu.style.visibility = 'hidden';
                profileMenu.style.transform = 'translateY(-10px)';
                profileMenu.classList.remove('active');
            }
        });
    }
}

// Update recent activity with real-time data
function updateRecentActivity() {
    // Simulate real-time updates
    setInterval(() => {
        const activities = [
            {
                user: 'Paolo Rayos',
                initials: 'PR',
                color: '#61bd4f',
                action: 'added a card to',
                board: 'Mobile App Development',
                time: Math.floor(Math.random() * 5) + 1 + ' hours ago'
            },
            {
                user: 'Luc Trevecedo',
                initials: 'LT',
                color: '#0079bf',
                action: 'completed a task in',
                board: 'Website Redesign',
                time: Math.floor(Math.random() * 8) + 1 + ' hours ago'
            },
            {
                user: 'Nathaniel Andrada',
                initials: 'NA',
                color: '#f2d600',
                action: 'commented on a card in',
                board: 'Marketing Campaign Q1',
                time: Math.floor(Math.random() * 24) + 1 + ' hours ago'
            },
            {
                user: 'Mike Johnson',
                initials: 'MJ',
                color: '#eb5a46',
                action: 'moved a card in',
                board: 'Product Roadmap 2024',
                time: Math.floor(Math.random() * 48) + 1 + ' hours ago'
            }
        ];
        
        // Randomly update activity
        if (Math.random() < 0.1) { // 10% chance every interval
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            addActivityItem(randomActivity);
        }
    }, 30000); // Check every 30 seconds
}

function addActivityItem(activity) {
    const activityList = document.querySelector('.activity-list');
    const firstItem = activityList.querySelector('.activity-item');
    
    const newItem = document.createElement('li');
    newItem.className = 'activity-item';
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateX(-20px)';
    
    newItem.innerHTML = `
        <div class="activity-avatar">
            <div class="avatar avatar-sm" style="background: ${activity.color}; ${activity.color === '#f2d600' ? 'color: #333;' : ''}">${activity.initials}</div>
        </div>
        <div class="activity-content">
            <div class="activity-text">
                <strong>${activity.user}</strong> ${activity.action} 
                <span class="activity-board">${activity.board}</span>
            </div>
            <div class="activity-time">just now</div>
        </div>
    `;
    
    activityList.insertBefore(newItem, firstItem);
    
    // Animate in
    setTimeout(() => {
        newItem.style.transition = 'all 0.3s ease';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove excess items (keep only 5)
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 5) {
        const lastItem = items[items.length - 1];
        lastItem.style.transition = 'all 0.3s ease';
        lastItem.style.opacity = '0';
        lastItem.style.transform = 'translateX(20px)';
        setTimeout(() => lastItem.remove(), 300);
    }
}

// Search functionality
function handleDashboardSearch(query) {
    const boardTiles = document.querySelectorAll('.board-tile:not(.create-new)');
    
    if (!query) {
        // Show all boards
        boardTiles.forEach(tile => {
            tile.style.display = 'flex';
        });
        return;
    }
    
    boardTiles.forEach(tile => {
        const title = tile.querySelector('.board-title').textContent.toLowerCase();
        const description = tile.querySelector('.board-description').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
            tile.style.display = 'flex';
        } else {
            tile.style.display = 'none';
        }
    });
}

// Board deletion functionality
let boardToDelete = null;

function confirmDeleteBoard(boardId, boardTitle) {
    boardToDelete = boardId;
    const boardNameElement = document.getElementById('board-name-to-delete');
    if (boardNameElement) {
        boardNameElement.textContent = boardTitle;
    }
    
    const modal = document.getElementById('delete-board-modal');
    if (modal) {
        openModal('delete-board-modal');
    }
}

async function deleteBoard() {
    if (!boardToDelete) {
        showNotification('No board selected for deletion', 'error');
        return;
    }
    
    const deleteButton = document.getElementById('confirm-delete-board');
    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    }
    
    try {
        const result = await window.api.deleteBoard({ board_id: boardToDelete });
        
        if (result.success) {
            showNotification('Board deleted successfully', 'success');
            
            // Remove the board tile from the grid
            const boardTile = document.querySelector(`[data-board-id="${boardToDelete}"]`);
            if (boardTile) {
                const tile = boardTile.closest('.board-tile');
                if (tile) {
                    tile.remove();
                }
            }
            
            // Close the modal
            closeModal(document.getElementById('delete-board-modal'));
            
            // Reload boards to update the display
            loadBoards();
        } else {
            showNotification(result.message || 'Failed to delete board', 'error');
        }
    } catch (error) {
        console.error('Error deleting board:', error);
        showNotification('Error deleting board', 'error');
    } finally {
        // Reset delete button
        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete Board';
        }
        boardToDelete = null;
    }
}

// Override the shared search function for dashboard-specific behavior
if (window.WorkShift) {
    const originalHandleSearch = window.handleSearch;
    window.handleSearch = function() {
        const searchInput = document.querySelector('.search-input');
        const query = searchInput.value.trim();
        handleDashboardSearch(query);
    };
}
