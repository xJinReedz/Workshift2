// Board JavaScript - WorkShift Board Management (Fixed Implementation)
let currentBoard = null;
let currentBoardId = null;

// Wait for database to be ready
function waitForDatabase() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 second timeout
        
        function check() {
            attempts++;
            
            if (window.db && window.api && typeof window.db.findBy === 'function') {
                resolve();
            } else if (attempts >= maxAttempts) {
                reject(new Error('Database failed to initialize'));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

// Initialize board
async function initializeBoard(boardId) {
    currentBoardId = boardId;
    
    try {
        console.log("Initializing board with ID:", boardId);
        
        // Wait for database to be ready
        await waitForDatabase();
        console.log("Database is ready");
        
        // Check if user is authenticated
        if (!window.api.currentUser) {
            throw new Error("User not authenticated");
        }
        console.log("User authenticated:", window.api.currentUser);
        
        await loadBoardData();
        
        // Set up user avatar
        const userResult = window.api.getCurrentUser();
        if (userResult.success) {
            updateUserAvatar(userResult.data.user);
        }
        
        // Initialize board interactions
        initializeBoardInteractions();
        
        console.log("Board initialized:", currentBoard?.title || "Unknown");
    } catch (error) {
        console.error("Error initializing board:", error);
        showNotification("Failed to load board. Redirecting to dashboard.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
}

// Load board data
async function loadBoardData() {
    console.log("Loading board data - checking prerequisites...");
    
    if (!window.db) {
        console.error("Database not available");
        throw new Error("Database not available");
    }
    
    if (!window.api.currentUser) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
    }
    
    console.log("Loading board data for ID:", currentBoardId, "User:", window.api.currentUser?.id);
    
    try {
        const result = window.db.getBoardWithLists(currentBoardId, window.api.currentUser.id);
        console.log("Database query result:", result);
        
        if (!result) {
            console.error("Board not found or access denied for board:", currentBoardId, "user:", window.api.currentUser.id);
            throw new Error("Board not found or access denied");
        }
        
        currentBoard = result;
        console.log("Board loaded successfully:", currentBoard);
        
        // Update page title
        document.title = `WorkShift - ${currentBoard.title}`;
        
        // Update board title
        const titleElement = document.getElementById('boardTitleText');
        if (titleElement) {
            titleElement.textContent = currentBoard.title;
        }
        
        // Update background
        setBoardBackground(currentBoard.background_color);
        
        // Render the lists and cards from the database
        renderLists();
        
        console.log("Board data loaded successfully:", currentBoard);
    } catch (error) {
        console.error("Error in loadBoardData:", error);
        throw error;
    }
}

// Set board background
function setBoardBackground(backgroundColor) {
    const colorToGradient = {
        '#0079bf': 'linear-gradient(135deg, #0079bf, #00c2e0)',
        '#61bd4f': 'linear-gradient(135deg, #61bd4f, #51e5ff)',
        '#f2d600': 'linear-gradient(135deg, #f2d600, #ff9f1a)',
        '#eb5a46': 'linear-gradient(135deg, #eb5a46, #ff6b6b)',
        '#c377e0': 'linear-gradient(135deg, #c377e0, #f093fb)',
        '#ff9f1a': 'linear-gradient(135deg, #ff9f1a, #feca57)'
    };
    
    const gradient = colorToGradient[backgroundColor] || colorToGradient['#0079bf'];
    
    // Update the board container background
    const boardContainer = document.querySelector('.board-container');
    if (boardContainer) {
        boardContainer.style.background = gradient;
    }
}

// Render all lists on the board
function renderLists() {
    console.log('Rendering lists for board:', currentBoardId);
    
    try {
        const lists = window.db.findBy('lists', { board_id: parseInt(currentBoardId) });
        
        const listsContainer = document.getElementById('boardLists');
        if (!listsContainer) {
            console.error('Lists container not found');
            return;
        }
        
        // Clear existing lists
        listsContainer.innerHTML = '';
        
        if (!lists || lists.length === 0) {
            console.log('No lists found for this board');
            // Still add the "Add a list" button even when there are no lists
            const addListHTML = `
                <div class="list add-list-inline">
                    <button class="add-list-btn-inline" onclick="showAddListModal()">
                        <i class="fas fa-plus"></i>
                        Add a list
                    </button>
                </div>
            `;
            listsContainer.insertAdjacentHTML('beforeend', addListHTML);
            return;
        }
        
        // Sort lists by position
        lists.sort((a, b) => (a.position || 0) - (b.position || 0));

        // Add each list
        lists.forEach(list => {
            const cards = window.db.findBy('cards', { list_id: list.id });
            
            const cardsHTML = cards.map(card => {
                // Get labels for this card
                const cardLabels = window.db.findBy('card_labels', { card_id: card.id });
                const allLabels = window.db.findBy('labels', {});
                
                let labelsHtml = '';
                if (cardLabels.length > 0) {
                    const labelElements = cardLabels.map(cardLabel => {
                        const label = allLabels.find(l => l.id === cardLabel.label_id);
                        if (label) {
                            return `<span class="card-label" style="background-color: ${label.color}; color: white; padding: 1px 4px; border-radius: 2px; font-size: 10px; font-weight: 500; margin-right: 2px; margin-bottom: 2px; display: inline-block; line-height: 1.2;">${escapeHtml(label.name)}</span>`;
                        }
                        return '';
                    }).join('');
                    
                    if (labelElements) {
                        labelsHtml = `<div class="card-labels" style="margin-bottom: 2px; line-height: 1;">${labelElements}</div>`;
                    }
                }
                
                // Format due date if it exists
                let dueDateHtml = '';
                if (card.is_completed && (card.is_completed === 1 || card.is_completed === true)) {
                    dueDateHtml = `
                        <div class="card-due-date completed">
                            <i class="fas fa-check-circle" style="color: #28a745;"></i>
                            <span style="color: #28a745; font-weight: 600;">COMPLETED</span>
                        </div>
                    `;
                } else if (card.due_date) {
                    const displayText = formatDueDateDisplay(card.due_date, card.is_completed);
                    const statusClass = getCountdownStatusClass(card.due_date, card.is_completed);
                    dueDateHtml = `
                        <div class="card-due-date ${statusClass}" data-due-date="${card.due_date}" data-card-id="${card.id}">
                            <i class="fas fa-clock"></i>
                            <span class="countdown-text">${displayText}</span>
                        </div>
                    `;
                }

                // Calculate checklist progress
                let checklistProgressHtml = '';
                if (window.db && typeof window.db.findBy === 'function') {
                    const checklistItems = window.db.findBy('checklist_items', { card_id: card.id });
                    if (checklistItems && checklistItems.length > 0) {
                        const completed = checklistItems.filter(item => item.is_completed).length;
                        const total = checklistItems.length;
                        const percentage = Math.round((completed / total) * 100);
                        
                        checklistProgressHtml = `
                            <div class="card-checklist-progress">
                                <div class="progress-container">
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <div class="progress-text">${completed}/${total} (${percentage}%)</div>
                                </div>
                            </div>
                        `;
                    }
                }

                return `
                    <div class="card-item" data-card-id="${card.id}">
                        ${labelsHtml}
                        <div class="card-title">${escapeHtml(card.title)}</div>
                        ${card.description ? `<div class="card-description">${escapeHtml(card.description.length > 80 ? card.description.substring(0, 80) + '...' : card.description)}</div>` : ''}
                        ${checklistProgressHtml}
                        ${dueDateHtml ? `<div class="card-meta">${dueDateHtml}</div>` : ''}
                    </div>
                `;
            }).join('');
            
            const listHTML = `
                <div class="list" data-list-id="${list.id}" data-list-name="${escapeHtml(list.title)}">
                    <div class="list-header">
                        <h3>${escapeHtml(list.title)}</h3>
                        <div class="list-actions">
                            <button class="list-menu-btn" data-list-id="${list.id}" title="List options">
                                <i class="fas fa-ellipsis-h"></i>
                                <span class="ellipsis-fallback">⋯</span>
                            </button>
                        </div>
                    </div>
                    <div class="list-body" id="list-${list.id}-cards">
                        ${cardsHTML}
                        <div class="add-card-section" data-list-id="${list.id}">
                            <button class="add-card-btn-inline" data-list-id="${list.id}">
                                <i class="fas fa-plus"></i>
                                Add a card
                            </button>
                            <div class="add-card-form" style="display: none;">
                                <input type="text" class="add-card-title-input" placeholder="Enter card title..." />
                                <div class="add-card-actions">
                                    <button class="btn btn-primary btn-sm add-card-submit">Add Card</button>
                                    <button class="btn btn-secondary btn-sm add-card-cancel">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            listsContainer.insertAdjacentHTML('beforeend', listHTML);
        });
        
        // Add the "Add a list" button at the end
        const addListHTML = `
            <div class="list add-list-inline">
                <button class="add-list-btn-inline" onclick="showAddListModal()">
                    <i class="fas fa-plus"></i>
                    Add a list
                </button>
            </div>
        `;
        listsContainer.insertAdjacentHTML('beforeend', addListHTML);
        
        console.log(`Rendered ${lists.length} lists`);

        // Re-initialize interactions after DOM is rebuilt
        setTimeout(() => {
            initializeBoardInteractions();
        }, 100);
        
    } catch (error) {
        console.error('Error rendering lists:', error);
    }
}

// Initialize board interactions
function initializeBoardInteractions() {
    console.log('Initializing board interactions...');
    initializeCardClicks();
    initializeAddCard();
    initializeAddCardForms();
    initializeListMenus();
    initializeBoardTitleEditing();
    initializeDragAndDrop(); // Enable drag and drop for cards
    startManilaClock();
    
    // Start countdown timers for due dates
    startCountdownTimers();
    
    console.log('Board interactions initialized');
}

// Initialize card clicks
function initializeCardClicks() {
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        card.removeEventListener('click', cardClickHandler);
        card.addEventListener('click', cardClickHandler);
        // Don't set cursor here - let drag initialization handle it
    });
}

// Card click handler - modified to work with drag
function cardClickHandler(e) {
    // Don't prevent default or stop propagation - let drag events work
    const cardId = this.getAttribute('data-card-id');
    
    // Use a small delay to distinguish click from drag start
    setTimeout(() => {
        if (!this.classList.contains('dragging')) {
            if (cardId) {
                openCardModal(parseInt(cardId));
            } else {
                console.error('No card ID found on clicked element');
            }
        }
    }, 100);
}

// Initialize drag and drop for cards
function initializeDragAndDrop() {
    console.log('🔥 Initializing drag and drop');
    
    const cards = document.querySelectorAll('.card-item');
    console.log(`Found ${cards.length} cards to make draggable`);
    
    cards.forEach(card => {
        // Make card draggable
        card.setAttribute('draggable', 'true');
        card.style.cursor = 'grab';
        
        // Remove any existing event listeners to avoid conflicts
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragend', handleDragEnd);
        
        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        console.log('✓ Card', card.dataset.cardId, 'is now draggable');
    });
    
    // Setup drop zones on lists (using actual class name from HTML)
    const listBodies = document.querySelectorAll('.list-body');
    console.log(`Setting up ${listBodies.length} drop zones on .list-body elements`);
    
    listBodies.forEach(listBody => {
        listBody.addEventListener('dragover', handleDragOver);
        listBody.addEventListener('dragenter', handleDragEnter);
        listBody.addEventListener('dragleave', handleDragLeave);
        listBody.addEventListener('drop', handleDrop);
        
        console.log('✓ Drop zone set up on:', listBody);
    });
    
    console.log('✅ Drag and drop initialized successfully');
}

let draggedCard = null;
let sourceListId = null;

// Handle drag start
function handleDragStart(e) {
    console.log('🚀 DRAG START EVENT FIRED!', {
        cardId: this.dataset.cardId,
        element: this
    });
    
    draggedCard = this;
    sourceListId = this.closest('.list').dataset.listId;
    
    this.classList.add('dragging');
    this.style.cursor = 'grabbing';
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.cardId);
    
    console.log('✅ Drag data set:', {
        cardId: this.dataset.cardId,
        sourceListId: sourceListId
    });
}

// Handle drag end
function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.cursor = 'grab';
    
    // Remove all drag-over classes
    document.querySelectorAll('.list-cards').forEach(list => {
        list.classList.remove('drag-over');
    });
    
    console.log('🏁 Drag ended');
    draggedCard = null;
    sourceListId = null;
}

// Handle drag over
function handleDragOver(e) {
    console.log('🔄 Drag over detected on:', this);
    if (e.preventDefault) {
        e.preventDefault(); // Allows drop
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

// Handle drag enter
function handleDragEnter(e) {
    console.log('➡️ Drag enter on:', this);
    this.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    console.log('⬅️ Drag leave from:', this);
    // Only remove if we're leaving the list, not a child element
    if (e.target === this) {
        this.classList.remove('drag-over');
    }
}

// Handle drop
async function handleDrop(e) {
    console.log('🎯 DROP EVENT TRIGGERED on:', this);
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops browser from redirecting
    }
    e.preventDefault();
    
    this.classList.remove('drag-over');
    
    if (!draggedCard) {
        console.warn('No dragged card found');
        return false;
    }
    
    const targetList = this.closest('.list');
    const targetListId = targetList.dataset.listId;
    const cardId = draggedCard.dataset.cardId;
    
    console.log('📥 Drop:', {
        cardId: cardId,
        fromList: sourceListId,
        toList: targetListId
    });
    
    // Don't do anything if dropped in same list
    if (sourceListId === targetListId) {
        console.log('Dropped in same list, no action needed');
        return false;
    }
    
    try {
        // Update card's list_id in database
        if (window.api && window.api.updateCard) {
            const response = await window.api.updateCard({
                card_id: parseInt(cardId),
                list_id: parseInt(targetListId)
            });
            
            if (response.success) {
                console.log('✅ Card moved to new list in database');
                // Refresh the board
                await renderLists();
                showNotification('Card moved successfully!', 'success');
            } else {
                console.error('API returned error:', response);
                showNotification('Failed to move card: ' + (response.error || 'Unknown error'), 'error');
            }
        } else if (window.db) {
            await window.db.update('cards', parseInt(cardId), { list_id: parseInt(targetListId) });
            console.log('✅ Card moved to new list in local database');
            // Refresh the board
            await renderLists();
            showNotification('Card moved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error moving card:', error);
        showNotification('Failed to move card: ' + error.message, 'error');
    }
    
    return false;
}

// Reset board to have only To Do list with test cards
function resetToDoOnlyBoard() {
    console.log('🔄 Resetting board to To Do only...');
    
    // Create test data structure
    const testBoard = {
        id: 1,
        title: "Test Board",
        lists: [
            {
                id: 1,
                title: "To Do",
                board_id: 1,
                cards: [
                    { id: 1, title: "Test Card 1", description: "Drag me!", list_id: 1 },
                    { id: 2, title: "Test Card 2", description: "Or drag me!", list_id: 1 },
                    { id: 3, title: "Test Card 3", description: "I'm draggable too!", list_id: 1 }
                ]
            },
            {
                id: 2,
                title: "In Progress",
                board_id: 1,
                cards: []
            }
        ]
    };
    
    // Render this test board using correct HTML structure
    const boardContainer = document.querySelector('.board-lists');
    if (boardContainer) {
        const listsHtml = testBoard.lists.map(list => `
            <div class="list" data-list-id="${list.id}">
                <div class="list-header">
                    <h3>${list.title}</h3>
                </div>
                <div class="list-body" id="list-${list.id}-cards">
                    ${list.cards.map(card => `
                        <div class="card-item" data-card-id="${card.id}">
                            <div class="card-title">${card.title}</div>
                            <div class="card-description">${card.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        boardContainer.innerHTML = listsHtml;
        
        // Re-initialize drag and drop
        initializeDragAndDrop();
        initializeCardClicks();
        
        console.log('✅ Test board created with draggable cards!');
    }
}

// Debug function to test drag functionality
function testDragFunctionality() {
    console.log('🔍 Testing drag functionality...');
    
    const cards = document.querySelectorAll('.card-item');
    console.log(`Found ${cards.length} cards`);
    
    cards.forEach((card, index) => {
        console.log(`Card ${index + 1}:`, {
            id: card.dataset.cardId,
            draggable: card.getAttribute('draggable'),
            cursor: window.getComputedStyle(card).cursor,
            userSelect: window.getComputedStyle(card).userSelect
        });
    });
    
    // Test drop zones
    const dropZones = document.querySelectorAll('.list-body');
    console.log(`\nFound ${dropZones.length} drop zones (.list-body)`);
    
    dropZones.forEach((zone, index) => {
        const parentList = zone.closest('.list');
        console.log(`Drop Zone ${index + 1}:`, {
            listId: parentList ? parentList.dataset.listId : 'No parent list',
            className: zone.className,
            id: zone.id
        });
    });
    
    // Check if lists exist
    const lists = document.querySelectorAll('.list');
    console.log(`\nFound ${lists.length} lists (.list)`);
    lists.forEach((list, index) => {
        console.log(`List ${index + 1}:`, {
            listId: list.dataset.listId,
            title: list.querySelector('h3')?.textContent || 'No title'
        });
    });
}

// Open card modal and load card details
async function openCardModal(cardId) {
    console.log("Opening card modal for card:", cardId);
    
    // Check if database is available
    if (!window.db || !window.api) {
        console.error('Database or API not available');
        showNotification('System not ready, please wait...', 'error');
        return;
    }
    
    // Initialize temporary checklist changes
    window.tempChecklistChanges = {
        added: [],
        deleted: [],
        toggled: []
    };
    
    try {
        // Show the modal immediately
        const modal = document.getElementById('card-detail-modal');
        if (!modal) {
            console.error('Card detail modal not found');
            return;
        }
        
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Load card details
        const response = await window.api.getCardDetails(cardId);
        
        if (!response.success) {
            showNotification('Failed to load card details: ' + response.message, 'error');
            closeCardModal();
            return;
        }
        
        const card = response.data.card;
        console.log('Loaded card details:', card);
        
        // Populate modal with card data
        populateCardModal(card);
        
    } catch (error) {
        console.error('Error opening card modal:', error);
        showNotification('Failed to open card', 'error');
        closeCardModal();
    }
}

// Populate card modal with data
function populateCardModal(card) {
    console.log('Populating card modal with:', card);
    
    // Store current card ID globally
    window.currentCardId = card.id;
    
    // Set card title
    const titleEdit = document.getElementById('cardTitleEdit');
    if (titleEdit) {
        titleEdit.value = card.title || '';
        
        // Add event listeners for title editing
        titleEdit.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Just blur the field - user must click "Save Changes" to save
                titleEdit.blur();
            }
            if (e.key === 'Escape') {
                titleEdit.value = card.title || '';
                titleEdit.blur();
            }
        });
        
        // Removed auto-save on blur - now requires manual save via "Save Changes" button
    }

    // Set list location
    if (card.list_id && window.db) {
        const list = window.db.findById('lists', parseInt(card.list_id));
        const listNameSpan = document.getElementById('cardListName');
        if (listNameSpan && list) {
            listNameSpan.textContent = list.title || 'Unknown List';
        }
    }
    
    // Set card description
    const descriptionTextarea = document.getElementById('cardDescription');
    if (descriptionTextarea) {
        descriptionTextarea.value = card.description || '';
        
        // Removed auto-save functionality - description now requires manual save via "Save Changes" button
    }

    // Set due date if exists
    if (card.due_date) {
        const dueDate = new Date(card.due_date);
        const dueDateInput = document.getElementById('cardDueDate');
        const dueTimeInput = document.getElementById('cardDueTime');
        
        if (dueDateInput) {
            dueDateInput.value = dueDate.toISOString().split('T')[0];
        }
        if (dueTimeInput) {
            const timeString = dueDate.toTimeString().slice(0, 5);
            dueTimeInput.value = timeString;
        }
    }
    
    // Load and display labels
    displayCardLabels(card.labels || []);
    
    // Load and display checklist items inline
    loadChecklistItemsInline(card.id);
    
    // Load and display attachments
    const attachments = window.db.findBy('attachments', { card_id: card.id });
    console.log('Loading attachments for card:', card.id, 'Found:', attachments);
    displayCardAttachments(attachments || []);
    
    // Set initial button styling based on completion status and update React state
    const isCompleted = !!(card.is_completed === 1 || card.is_completed === true);
    
    // Update React component state instead of DOM manipulation
    if (window.updateCardCompletionState) {
        window.updateCardCompletionState(isCompleted);
    }
    
    // Add real-time validation for deadline fields
    setupDeadlineValidation();
}

// Function to setup deadline validation
function setupDeadlineValidation() {
    const dueDateInput = document.getElementById('cardDueDate');
    const dueTimeInput = document.getElementById('cardDueTime');
    
    if (!dueDateInput || !dueTimeInput) return;
    
    // Function to validate deadline
    function validateDeadline() {
        const dateValue = dueDateInput.value;
        const timeValue = dueTimeInput.value;
        
        if (!dateValue) return true; // No date selected is valid
        
        let deadlineDateTime;
        if (timeValue) {
            deadlineDateTime = new Date(`${dateValue} ${timeValue}:00`);
        } else {
            deadlineDateTime = new Date(`${dateValue} 00:00:00`);
        }
        
        // Get current Manila time
        const now = new Date();
        const manilaOffset = 8 * 60; // UTC+8 in minutes
        const nowManila = new Date(now.getTime() + (manilaOffset * 60000));
        const deadlineManila = new Date(deadlineDateTime.getTime() + (manilaOffset * 60000));
        
        const isPastDeadline = deadlineManila <= nowManila;
        
        // Update input styling
        const inputs = [dueDateInput, dueTimeInput];
        inputs.forEach(input => {
            if (isPastDeadline) {
                input.style.borderColor = '#dc3545';
                input.style.backgroundColor = '#fff5f5';
            } else {
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });
        
        // Show/hide warning message
        let warningMsg = document.getElementById('deadline-warning');
        if (isPastDeadline) {
            if (!warningMsg) {
                warningMsg = document.createElement('div');
                warningMsg.id = 'deadline-warning';
                warningMsg.style.color = '#dc3545';
                warningMsg.style.fontSize = '12px';
                warningMsg.style.marginTop = '4px';
                warningMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Deadline cannot be set in the past';
                dueTimeInput.parentNode.appendChild(warningMsg);
            }
        } else {
            if (warningMsg) {
                warningMsg.remove();
            }
        }
        
        return !isPastDeadline;
    }
    
    // Set minimum date to today (Manila time)
    const now = new Date();
    const manilaOffset = 8 * 60; // UTC+8 in minutes
    const todayManila = new Date(now.getTime() + (manilaOffset * 60000));
    const todayString = todayManila.toISOString().split('T')[0];
    dueDateInput.min = todayString;
    
    // Add event listeners
    dueDateInput.addEventListener('change', validateDeadline);
    dueTimeInput.addEventListener('change', validateDeadline);
    dueDateInput.addEventListener('input', validateDeadline);
    dueTimeInput.addEventListener('input', validateDeadline);
}

// Display card labels
function displayCardLabels(labels) {
    const cardId = window.currentCardId;
    if (!cardId) return;
    
    // Check if database is available
    if (!window.db || typeof window.db.findBy !== 'function') {
        console.warn('Database not available, skipping label display');
        return;
    }
    
    // Get labels for current card from database
    const cardLabels = window.db.findBy('card_labels', { card_id: parseInt(cardId) });
    const allLabels = window.db.findBy('labels', {});
    
    // Create labels display in card modal (if space exists)
    const cardModal = document.getElementById('card-detail-modal');
    if (cardModal) {
        // Look for a labels section in the modal
        let labelsContainer = cardModal.querySelector('.card-labels-section');
        if (!labelsContainer) {
            // Create labels section if it doesn't exist
            const modalBody = cardModal.querySelector('.card-main-content');
            if (modalBody) {
                labelsContainer = document.createElement('div');
                labelsContainer.className = 'card-section card-labels-section';
                labelsContainer.innerHTML = `
                    <div class="section-header">
                        <i class="fas fa-tag"></i>
                        <h3>Labels</h3>
                    </div>
                    <div class="section-content">
                        <div class="card-labels-display" id="cardLabelsDisplay"></div>
                    </div>
                `;
                modalBody.insertBefore(labelsContainer, modalBody.firstChild);
            }
        }
        
        const labelsDisplay = cardModal.querySelector('#cardLabelsDisplay');
        if (labelsDisplay) {
            if (cardLabels.length === 0) {
                labelsDisplay.innerHTML = '<p class="no-labels">No labels assigned</p>';
            } else {
                const labelsHTML = cardLabels.map(cardLabel => {
                    const label = allLabels.find(l => l.id === cardLabel.label_id);
                    if (label) {
                        return `<span class="label-badge" style="background-color: ${label.color}">${escapeHtml(label.name)}</span>`;
                    }
                    return '';
                }).join('');
                labelsDisplay.innerHTML = labelsHTML;
            }
        }
    }
}

// Display card attachments  
function displayCardAttachments(attachments) {
    console.log('displayCardAttachments called with:', attachments);
    const attachmentsContainer = document.getElementById('attachmentsList');
    if (!attachmentsContainer) {
        console.error('Attachments container not found');
        return;
    }
    
    console.log('Attachments container found:', attachmentsContainer);
    
    if (!attachments || attachments.length === 0) {
        console.log('No attachments to display');
        attachmentsContainer.innerHTML = '<p class="no-attachments text-muted" style="font-style: italic;">No attachments yet.</p>';
        return;
    }
    
    console.log('Displaying', attachments.length, 'attachments');
    const attachmentsHTML = attachments.map(attachment => `
        <div class="attachment-item" data-attachment-id="${attachment.id}">
            <div class="attachment-info">
                <i class="fas fa-${getFileIcon(attachment.filename)}"></i>
                <div class="attachment-details">
                    <div class="attachment-name">${escapeHtml(attachment.filename)}</div>
                    <div class="attachment-meta">
                        ${formatFileSize(attachment.file_size)} • Added ${formatDate(attachment.created_at)}
                    </div>
                </div>
            </div>
            <div class="attachment-actions">
                <button class="btn-icon" onclick="downloadAttachment(${attachment.id})" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteAttachment(${attachment.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    console.log('Generated HTML:', attachmentsHTML);
    attachmentsContainer.innerHTML = attachmentsHTML;
}

// Get file icon based on file extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'file-pdf',
        'doc': 'file-word', 'docx': 'file-word',
        'xls': 'file-excel', 'xlsx': 'file-excel',
        'ppt': 'file-powerpoint', 'pptx': 'file-powerpoint',
        'jpg': 'file-image', 'jpeg': 'file-image', 'png': 'file-image', 'gif': 'file-image',
        'mp4': 'file-video', 'avi': 'file-video', 'mov': 'file-video',
        'mp3': 'file-audio', 'wav': 'file-audio',
        'zip': 'file-archive', 'rar': 'file-archive',
        'txt': 'file-alt'
    };
    return iconMap[ext] || 'file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Load and display checklist items inline
function loadChecklistItemsInline(cardId) {
    const checklistContainer = document.getElementById('checklistItemsInline');
    if (!checklistContainer) return;
    
    // Get saved items from database
    let items = window.db.findBy('checklist_items', { card_id: cardId }) || [];
    
    // Filter out items marked for deletion
    if (window.tempChecklistChanges && window.tempChecklistChanges.deleted) {
        items = items.filter(item => !window.tempChecklistChanges.deleted.includes(item.id));
    }
    
    // Add temporary items that haven't been saved yet
    if (window.tempChecklistChanges && window.tempChecklistChanges.added) {
        items = [...items, ...window.tempChecklistChanges.added];
    }
    
    // Apply toggle changes
    if (window.tempChecklistChanges && window.tempChecklistChanges.toggled) {
        items = items.map(item => {
            const toggledItem = window.tempChecklistChanges.toggled.find(t => t.id === item.id);
            if (toggledItem) {
                return { ...item, is_completed: toggledItem.is_completed };
            }
            return item;
        });
    }
    
    if (!items || items.length === 0) {
        checklistContainer.innerHTML = '';
        updateChecklistProgress(0, 0);
        return;
    }
    
    const itemsHTML = items.map(item => `
        <div class="checklist-item-inline" data-item-id="${item.id}">
            <div class="item-checkbox">
                <input type="checkbox" id="item-inline-${item.id}" ${item.is_completed ? 'checked' : ''} 
                       onchange="toggleChecklistItemInline('${item.id}')">
            </div>
            <div class="item-content ${item.is_completed ? 'completed' : ''}">
                <span class="item-text">${escapeHtml(item.content)}</span>
            </div>
            <div class="item-actions">
                <button class="btn-icon btn-edit" onclick="openEditChecklistItemModal('${item.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteChecklistItemInline('${item.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    checklistContainer.innerHTML = itemsHTML;
    
    // Update progress bar
    const completedItems = items.filter(item => item.is_completed).length;
    updateChecklistProgress(completedItems, items.length);
}

// Update checklist progress bar
function updateChecklistProgress(completed, total) {
    const progressContainer = document.getElementById('checklistProgressContainer');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    
    if (!progressContainer || !progressText || !progressBar) return;
    
    if (total === 0) {
        progressContainer.style.display = 'none';
        return;
    }
    
    progressContainer.style.display = 'flex';
    
    const percentage = Math.round((completed / total) * 100);
    progressText.textContent = `${completed}/${total} (${percentage}%)`;
    
    progressBar.style.width = `${percentage}%`;
    
    // Add complete class if all items are done
    if (completed === total && total > 0) {
        progressBar.classList.add('complete');
    } else {
        progressBar.classList.remove('complete');
    }
    
    // Note: Auto-complete/incomplete will now only happen when "Save Changes" is clicked
}

// Function to automatically mark card as complete
async function autoCompleteCard() {
    const cardId = window.currentCardId;
    if (!cardId) return;
    
    try {
        // Check if card is already completed
        const cardResponse = await window.api.getCardDetails(cardId);
        if (!cardResponse.success) return;
        
        const card = cardResponse.data.card;
        const isAlreadyComplete = !!(card.is_completed === 1 || card.is_completed === true);
        
        if (!isAlreadyComplete) {
            // Mark card as complete
            const response = await window.api.updateCard({
                card_id: cardId,
                is_completed: 1
            });
            
            if (response.success) {
                // Update the complete button in the modal
                const completeButton = document.querySelector('button[onclick="toggleCardComplete()"]');
                if (completeButton) {
                    completeButton.innerHTML = '<i class="fas fa-undo"></i> Mark as Incomplete';
                    completeButton.style.backgroundColor = '#6c757d';
                    completeButton.style.color = '#ffffff';
                    completeButton.style.borderColor = '#6c757d';
                }
                
                // Refresh the board to show completion status
                renderLists();
                
                // Show notification
                showNotification('Card automatically marked as complete!', 'success');
            }
        }
    } catch (error) {
        console.error('Error auto-completing card:', error);
    }
}

// Function to automatically mark card as incomplete
async function autoIncompleteCard() {
    const cardId = window.currentCardId;
    if (!cardId) return;
    
    try {
        // Check if card is currently completed
        const cardResponse = await window.api.getCardDetails(cardId);
        if (!cardResponse.success) return;
        
        const card = cardResponse.data.card;
        const isCurrentlyComplete = !!(card.is_completed === 1 || card.is_completed === true);
        
        if (isCurrentlyComplete) {
            // Mark card as incomplete
            const response = await window.api.updateCard({
                card_id: cardId,
                is_completed: 0
            });
            
            if (response.success) {
                // Update the complete button in the modal
                const completeButton = document.querySelector('button[onclick="toggleCardComplete()"]');
                if (completeButton) {
                    completeButton.innerHTML = '<i class="fas fa-check"></i> Mark as Complete';
                    completeButton.style.backgroundColor = '#28a745';
                    completeButton.style.color = '#ffffff';
                    completeButton.style.borderColor = '#28a745';
                }
                
                // Refresh the board to show incomplete status
                renderLists();
                
                // Show notification
                showNotification('Card automatically marked as incomplete', 'info');
            }
        }
    } catch (error) {
        console.error('Error auto-incompleting card:', error);
    }
}

// Show add item form
function showAddItemForm() {
    const form = document.getElementById('addItemForm');
    const button = document.getElementById('addItemBtn');
    const input = document.getElementById('newChecklistItemInline');
    
    if (form && button && input) {
        form.style.display = 'block';
        button.style.display = 'none';
        input.focus();
    }
}

// Cancel add item
function cancelAddItem() {
    const form = document.getElementById('addItemForm');
    const button = document.getElementById('addItemBtn');
    const input = document.getElementById('newChecklistItemInline');
    
    if (form && button && input) {
        form.style.display = 'none';
        button.style.display = 'block';
        input.value = '';
    }
}

// Add checklist item inline
// Temporary storage for unsaved checklist items
window.tempChecklistItems = [];
window.tempChecklistChanges = {
    added: [],
    deleted: [],
    toggled: []
};

async function addChecklistItemInline() {
    const input = document.getElementById('newChecklistItemInline');
    const cardId = window.currentCardId;
    
    if (!input || !cardId) return;
    
    const content = input.value.trim();
    if (!content) {
        showNotification('Please enter an item', 'error');
        return;
    }
    
    try {
        // Create temporary item (not saved to database yet)
        const item = {
            id: 'temp_' + Date.now(), // Temporary ID
            card_id: cardId,
            content: content,
            is_completed: false,
            position: Date.now(),
            isTemp: true // Flag to identify unsaved items
        };
        
        // Add to temporary storage
        window.tempChecklistChanges.added.push(item);
        
        loadChecklistItemsInline(cardId);
        cancelAddItem();
        
        // Show reminder to save changes
        showNotification('Item added. Click "Save Changes" to apply.', 'info');
    } catch (error) {
        console.error('Error adding checklist item:', error);
        showNotification('Failed to add item', 'error');
    }
}

// Toggle checklist item inline
async function toggleChecklistItemInline(itemId) {
    try {
        // Check if it's a temp item
        const isTemp = String(itemId).startsWith('temp_');
        
        let item;
        if (isTemp) {
            // Find in temporary added items
            item = window.tempChecklistChanges.added.find(i => i.id === itemId);
            if (item) {
                item.is_completed = !item.is_completed;
            }
        } else {
            // Convert itemId to number for consistent comparison
            const numericItemId = parseInt(itemId);
            
            // Get from database
            item = window.db.findById('checklist_items', numericItemId);
            if (!item) {
                showNotification('Checklist item not found', 'error');
                return;
            }
            
            // Store toggle change temporarily (using numeric ID for consistency)
            const existingToggle = window.tempChecklistChanges.toggled.find(t => t.id === numericItemId);
            if (existingToggle) {
                existingToggle.is_completed = !existingToggle.is_completed;
            } else {
                window.tempChecklistChanges.toggled.push({
                    id: numericItemId,
                    is_completed: !item.is_completed
                });
            }
        }
        
        // Reload to show changes
        if (window.currentCardId) {
            loadChecklistItemsInline(window.currentCardId);
        }
        
        // Show reminder to save changes
        showNotification('Checklist updated. Click "Save Changes" to apply.', 'info');
        
    } catch (error) {
        console.error('Error toggling checklist item:', error);
        showNotification('Failed to update item', 'error');
    }
}

// Delete checklist item inline
async function deleteChecklistItemInline(itemId) {
    try {
        // Check if it's a temp item
        const isTemp = String(itemId).startsWith('temp_');
        
        if (isTemp) {
            // Remove from temporary added items
            window.tempChecklistChanges.added = window.tempChecklistChanges.added.filter(i => i.id !== itemId);
        } else {
            // Convert itemId to number for consistent comparison
            const numericItemId = parseInt(itemId);
            
            // Mark for deletion (will be deleted when "Save Changes" is clicked)
            if (!window.tempChecklistChanges.deleted.includes(numericItemId)) {
                window.tempChecklistChanges.deleted.push(numericItemId);
            }
        }
        
        if (window.currentCardId) {
            loadChecklistItemsInline(window.currentCardId);
        }
        
        // Show reminder to save changes
        showNotification('Item marked for deletion. Click "Save Changes" to apply.', 'info');
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        showNotification('Failed to delete item', 'error');
    }
}

// Variables for checklist item editing
let editingChecklistItemId = null;

// Open edit checklist item modal
function openEditChecklistItemModal(itemId) {
    const item = window.db.findById('checklist_items', parseInt(itemId));
    if (!item) {
        showNotification('Checklist item not found', 'error');
        return;
    }
    
    editingChecklistItemId = itemId;
    
    const modal = document.getElementById('edit-checklist-item-modal');
    const input = document.getElementById('editChecklistItemInput');
    
    if (modal && input) {
        input.value = item.content;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        input.focus();
    }
}

// Close edit checklist item modal
function closeEditChecklistItemModal() {
    const modal = document.getElementById('edit-checklist-item-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    editingChecklistItemId = null;
}

// Save checklist item edit
async function saveChecklistItemEdit() {
    if (!editingChecklistItemId) return;
    
    const input = document.getElementById('editChecklistItemInput');
    const newContent = input.value.trim();
    
    if (!newContent) {
        showNotification('Item content cannot be empty', 'error');
        return;
    }
    
    try {
        const result = window.db.update('checklist_items', parseInt(editingChecklistItemId), {
            content: newContent
        });
        
        if (result) {
            showNotification('Item updated successfully', 'success');
            loadChecklistItemsInline(window.currentCardId);
            closeEditChecklistItemModal();
        } else {
            showNotification('Failed to update item', 'error');
        }
    } catch (error) {
        console.error('Error updating checklist item:', error);
        showNotification('Failed to update item', 'error');
    }
}

// Open delete checklist item modal
function openDeleteChecklistItemModal(itemId) {
    const item = window.db.findById('checklist_items', parseInt(itemId));
    if (!item) {
        showNotification('Checklist item not found', 'error');
        return;
    }
    
    editingChecklistItemId = itemId;
    
    const modal = document.getElementById('delete-checklist-item-modal');
    const itemText = document.getElementById('deleteChecklistItemText');
    
    if (modal && itemText) {
        itemText.textContent = item.content;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

// Close delete checklist item modal
function closeDeleteChecklistItemModal() {
    const modal = document.getElementById('delete-checklist-item-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    editingChecklistItemId = null;
}

// Confirm delete checklist item
async function confirmDeleteChecklistItem() {
    if (!editingChecklistItemId) return;
    
    try {
        const result = window.db.delete('checklist_items', parseInt(editingChecklistItemId));
        if (result) {
            showNotification('Item deleted successfully', 'success');
            
            // Reload checklist items in modal (for regular checklist modal)
            if (typeof loadChecklistItems === 'function') {
                loadChecklistItems();
            }
            
            // Update checklist progress
            if (typeof updateChecklistProgress === 'function') {
                updateChecklistProgress();
            }
            
            // Reload inline checklist items if in card detail modal
            if (window.currentCardId) {
                if (typeof loadChecklistItemsInline === 'function') {
                    loadChecklistItemsInline(window.currentCardId);
                }
            }
            
            // Refresh board to update any progress indicators
            if (typeof renderLists === 'function') {
                renderLists();
            }
            
            closeDeleteChecklistItemModal();
        } else {
            showNotification('Failed to delete item', 'error');
        }
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        showNotification('Failed to delete item', 'error');
    }
}

// Close card modal
function closeCardModal() {
    console.log("Closing card modal");
    
    // Clear temporary checklist changes (discard unsaved changes)
    window.tempChecklistChanges = {
        added: [],
        deleted: [],
        toggled: []
    };
    
    const modal = document.getElementById('card-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Clear current card ID
    window.currentCardId = null;
}

// Initialize add card functionality
function initializeAddCard() {
    console.log('Initializing add card buttons...');
    const addCardBtns = document.querySelectorAll('.add-card-btn, .add-card-btn-inline');
    console.log('Found add card buttons:', addCardBtns.length);

    addCardBtns.forEach((btn, index) => {
        console.log(`Setting up button ${index}:`, btn);
        btn.removeEventListener('click', handleAddCardClick);
        btn.addEventListener('click', handleAddCardClick);
    });
}

// Handle add card click
function handleAddCardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add card button clicked');
    
    const button = e.currentTarget;
    const listId = button.getAttribute('data-list-id');
    
    if (!listId) {
        console.error('No list ID found');
        return;
    }
    
    // Find the add card section
    const addCardSection = button.closest('.add-card-section');
    if (!addCardSection) {
        console.error('Add card section not found');
        return;
    }
    
    // Hide the button and show the form
    button.style.display = 'none';
    const form = addCardSection.querySelector('.add-card-form');
    if (form) {
        form.style.display = 'block';
        const input = form.querySelector('.add-card-title-input');
        if (input) {
            input.focus();
        }
    }
}

// Open add card modal  
function openAddCardModal(listId) {
    console.log('Opening add card modal for list:', listId);
    
    const modal = document.getElementById('add-card-modal');
    if (!modal) {
        console.error('Add card modal not found');
        return;
    }
    
    // Set the target list ID
    const targetListIdInput = modal.querySelector('#targetListId');
    if (targetListIdInput) {
        targetListIdInput.value = listId;
    }
    
    // Clear form
    const titleInput = modal.querySelector('#newCardTitle');
    const descInput = modal.querySelector('#newCardDescription');
    
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    
    // Show modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    setTimeout(() => {
        if (titleInput) titleInput.focus();
    }, 100);
}

// Make function available globally for HTML event handlers
window.openAddCardModal = openAddCardModal;

// Handle add card form submission
function handleAddCard(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('newCardTitle');
    const descInput = document.getElementById('newCardDescription');
    const targetListInput = document.getElementById('targetListId');
    
    if (!titleInput || !descInput || !targetListInput) {
        console.error('Required form elements not found');
        return;
    }
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const listId = targetListInput.value;
    
    if (!title) {
        showNotification('Please enter a card title', 'error');
        return;
    }
    
    if (!listId) {
        showNotification('Target list not specified', 'error');
        return;
    }
    
    // Create card in database
    const cardData = {
        title: title,
        description: description,
        list_id: parseInt(listId),
        position: getNextCardPosition(listId)
    };
    
    try {
        const result = window.db.insert('cards', cardData);
        
        if (result) {
            showNotification('Card created successfully!', 'success');
            
            // Close modal
            closeModal(document.getElementById('add-card-modal'));
            
            // Refresh the board to show the new card
            renderLists();
        }
    } catch (error) {
        console.error('Error creating card:', error);
        showNotification('Failed to create card', 'error');
    }
}

// Close modal
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Get next card position
function getNextCardPosition(listId) {
    const listElement = document.querySelector(`[data-list-id="${listId}"]`);
    if (listElement) {
        const cards = listElement.querySelectorAll('.card-item');
        return cards.length;
    }
    return 0;
}

// Initialize add card forms (inline)
function initializeAddCardForms() {
    // Initialize submit buttons
    const submitButtons = document.querySelectorAll('.add-card-submit');
    submitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('.add-card-form');
            const section = this.closest('.add-card-section');
            const listId = section.getAttribute('data-list-id');
            const input = form.querySelector('.add-card-title-input');
            
            if (!input || !listId) return;
            
            const title = input.value.trim();
            if (!title) {
                showNotification('Please enter a card title', 'error');
                return;
            }
            
            // Create card
            const cardData = {
                title: title,
                description: '',
                list_id: parseInt(listId),
                position: getNextCardPosition(listId)
            };
            
            try {
                const result = window.db.insert('cards', cardData);
                
                if (result) {
                    showNotification('Card created successfully!', 'success');
                    
                    // Reset form
                    input.value = '';
                    form.style.display = 'none';
                    section.querySelector('.add-card-btn-inline').style.display = 'block';
                    
                    // Refresh the board
                    renderLists();
                }
            } catch (error) {
                console.error('Error creating card:', error);
                showNotification('Failed to create card', 'error');
            }
        });
    });
    
    // Initialize cancel buttons
    const cancelButtons = document.querySelectorAll('.add-card-cancel');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('.add-card-form');
            const section = this.closest('.add-card-section');
            const input = form.querySelector('.add-card-title-input');
            
            // Reset and hide form
            if (input) input.value = '';
            form.style.display = 'none';
            section.querySelector('.add-card-btn-inline').style.display = 'block';
        });
    });
    
    // Allow Enter key to submit
    const inputs = document.querySelectorAll('.add-card-title-input');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = this.closest('.add-card-form');
                const submitBtn = form.querySelector('.add-card-submit');
                if (submitBtn) submitBtn.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                const form = this.closest('.add-card-form');
                const cancelBtn = form.querySelector('.add-card-cancel');
                if (cancelBtn) cancelBtn.click();
            }
        });
    });
}

// Labels modal functionality
let selectedLabelColor = '#61bd4f';

function openLabelsModal() {
    console.log('Opening labels modal...');
    const modal = document.getElementById('labels-modal');
    if (!modal) {
        console.error('Labels modal not found');
        return;
    }
    
    // Show the modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Clear search input when opening modal and ensure all labels are visible
    const searchInput = document.getElementById('labelsSearch');
    if (searchInput) {
        searchInput.value = '';
        // Reset any filtered labels to be visible
        setTimeout(() => {
            const labelItems = document.querySelectorAll('#labels-modal .label-item');
            labelItems.forEach(item => {
                item.style.display = 'flex';
            });
            // Remove any "no results" message
            const noResults = document.querySelector('#labelsList .no-search-results');
            if (noResults) {
                noResults.remove();
            }
        }, 100);
    }
    
    // Initialize labels modal
    initializeLabelsModal();
}

function initializeLabelsModal() {
    // Initialize color picker
    document.querySelectorAll('.color-picker .color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-picker .color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedLabelColor = this.getAttribute('data-color');
        });
    });
    
    // Initialize character counter for label name input
    const labelNameInput = document.getElementById('newLabelName');
    const labelNameCounter = document.getElementById('newLabelCounter');
    
    if (labelNameInput && labelNameCounter) {
        labelNameInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            labelNameCounter.textContent = `${currentLength}/13`;
            
            // Remove existing classes
            labelNameCounter.classList.remove('warning', 'error');
            
            // Add appropriate class based on character count
            if (currentLength >= 13) {
                labelNameCounter.classList.add('error');
            } else if (currentLength >= 11) {
                labelNameCounter.classList.add('warning');
            }
        });
        
        // Initialize counter display
        labelNameCounter.textContent = `${labelNameInput.value.length}/13`;
    }
    
    // Load existing labels first
    loadLabelsForModal();
}

// Setup label search functionality
function setupLabelSearch() {
    console.log('Setting up label search...');
    const searchInput = document.getElementById('labelsSearch');
    
    if (!searchInput) {
        console.error('Search input not found!');
        return;
    }
    
    // Clear any existing event listeners by cloning the element
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    console.log('Search input found and reset');
    
    // Add event listener for search
    newSearchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        console.log('Search input changed to:', searchTerm);
        performLabelFilter(searchTerm);
    });
    
    // Test the search immediately if there's already a value
    if (newSearchInput.value.trim()) {
        performLabelFilter(newSearchInput.value.toLowerCase().trim());
    }
}

// Perform the actual label filtering
function performLabelFilter(searchTerm) {
    console.log('Performing filter with term:', searchTerm);
    
    // Get all label items specifically from the labels modal
    const labelItems = document.querySelectorAll('#labels-modal .label-item');
    console.log('Found label items to filter:', labelItems.length);
    
    let visibleCount = 0;
    
    labelItems.forEach((item, index) => {
        const labelNameElement = item.querySelector('.label-name');
        if (labelNameElement) {
            const labelText = labelNameElement.textContent.toLowerCase();
            console.log(`Label ${index}: "${labelText}"`);
            
            if (searchTerm === '' || labelText.includes(searchTerm)) {
                item.style.display = 'flex';
                visibleCount++;
                console.log(`  → SHOWING: "${labelText}"`);
            } else {
                item.style.display = 'none';
                console.log(`  → HIDING: "${labelText}"`);
            }
        } else {
            console.log(`Label ${index}: No label-name element found`);
        }
    });
    
    console.log(`Filter complete. Visible labels: ${visibleCount}`);
    
    // Handle "no results" message
    showNoResultsMessage(searchTerm, visibleCount);
}

// Show or hide "no results" message
function showNoResultsMessage(searchTerm, visibleCount) {
    const labelsList = document.getElementById('labelsList');
    if (!labelsList) return;
    
    const existingNoResults = labelsList.querySelector('.no-search-results');
    
    if (visibleCount === 0 && searchTerm !== '') {
        if (!existingNoResults) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-search-results';
            noResultsDiv.innerHTML = `<p class="no-labels">No labels found matching "${searchTerm}"</p>`;
            labelsList.appendChild(noResultsDiv);
            console.log('Added no results message');
        }
    } else {
        if (existingNoResults) {
            existingNoResults.remove();
            console.log('Removed no results message');
        }
    }
}

// Initialize search after labels are loaded
function initializeSearchAfterLoad() {
    const searchInput = document.getElementById('labelsSearch');
    if (searchInput) {
        // Clear any existing value and reset display
        const currentValue = searchInput.value.toLowerCase().trim();
        if (currentValue) {
            filterLabels(currentValue);
        }
    }
}

// Make function available globally for potential future use
window.initializeSearchAfterLoad = initializeSearchAfterLoad;

// Character counter update function for edit label
function updateEditLabelCounter() {
    const nameCounter = document.getElementById('editLabelCounter');
    if (nameCounter) {
        const currentLength = this.value.length;
        nameCounter.textContent = `${currentLength}/13`;
        
        // Remove existing classes
        nameCounter.classList.remove('warning', 'error');
        
        // Add appropriate class based on character count
        if (currentLength >= 13) {
            nameCounter.classList.add('error');
        } else if (currentLength >= 11) {
            nameCounter.classList.add('warning');
        }
    }
}

// Filter labels based on search term
function filterLabels(searchTerm) {
    console.log('Filtering labels with search term:', searchTerm);
    const labelItems = document.querySelectorAll('#labels-modal .label-item');
    console.log('Found label items:', labelItems.length);
    
    let visibleCount = 0;
    
    labelItems.forEach(item => {
        const labelName = item.querySelector('.label-name');
        if (labelName) {
            const labelText = labelName.textContent.toLowerCase();
            console.log('Checking label:', labelText, 'against search:', searchTerm);
            
            if (searchTerm === '' || labelText.includes(searchTerm)) {
                item.style.display = 'flex';
                visibleCount++;
                console.log('Showing label:', labelText);
            } else {
                item.style.display = 'none';
                console.log('Hiding label:', labelText);
            }
        }
    });
    
    console.log('Visible labels after filtering:', visibleCount);
    
    // Show "no results" message if all labels are hidden
    const labelsList = document.getElementById('labelsList');
    
    if (labelsList) {
        const existingNoResults = labelsList.querySelector('.no-search-results');
        
        if (visibleCount === 0 && searchTerm !== '') {
            if (!existingNoResults) {
                const noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-search-results';
                noResultsDiv.innerHTML = `<p class="no-labels">No labels found matching "${searchTerm}"</p>`;
                labelsList.appendChild(noResultsDiv);
            }
        } else {
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
    }
}

async function loadLabelsForModal() {
    const labelsList = document.getElementById('labelsList');
    if (!labelsList) {
        console.error('Labels list element not found');
        return;
    }
    
    const cardId = window.currentCardId;
    
    labelsList.innerHTML = '<div class="loading">Loading labels...</div>';
    
    try {
        // Get labels from our JavaScript database
        const allLabels = window.db.findBy('labels', { board_id: parseInt(currentBoardId) });
        
        // Get card labels to see which are assigned
        let cardLabels = [];
        if (cardId) {
            cardLabels = window.db.findBy('card_labels', { card_id: parseInt(cardId) });
        }
        
        labelsList.innerHTML = '';
        
        if (allLabels.length === 0) {
            labelsList.innerHTML = '<p class="no-labels">No labels created yet. Create your first label below.</p>';
            return;
        }
        
        allLabels.forEach(label => {
            const isAssigned = cardLabels.some(cl => cl.label_id === label.id);
            const labelItem = document.createElement('div');
            labelItem.className = `label-item ${isAssigned ? 'assigned' : ''}`;
            labelItem.innerHTML = `
                <div class="label-preview" style="background: ${label.color};">
                    <span class="label-name">${escapeHtml(label.name)}</span>
                    <i class="fas fa-check label-check" style="display: ${isAssigned ? 'block' : 'none'};"></i>
                </div>
                <div class="label-actions">
                    <button class="btn-icon" onclick="toggleLabel('${label.id}', '${cardId}')" title="Toggle">
                        <i class="fas fa-${isAssigned ? 'minus' : 'plus'}"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="openEditLabelModal('${label.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteLabel('${label.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            labelsList.appendChild(labelItem);
        });
        
        // Initialize search functionality after labels are loaded
        setupLabelSearch();
        
    } catch (error) {
        console.error('Error loading labels:', error);
        labelsList.innerHTML = '<p class="no-labels error">Failed to load labels. Please try again.</p>';
        showNotification('Failed to load labels', 'error');
    }
}

async function createLabel() {
    const nameInput = document.getElementById('newLabelName');
    if (!nameInput) {
        console.error('Label name input not found');
        return;
    }
    
    const name = nameInput.value.trim();
    
    if (!name) {
        showNotification('Please enter a label name', 'error');
        return;
    }
    
    if (name.length > 13) {
        showNotification('Label name cannot exceed 13 characters', 'error');
        return;
    }
    
    try {
        const result = window.db.insert('labels', {
            board_id: parseInt(currentBoardId),
            name: name,
            color: selectedLabelColor
        });
        
        if (result) {
            // Clear input
            nameInput.value = '';
            
            // Reset color selection to default
            document.querySelectorAll('.color-picker .color-option').forEach(o => o.classList.remove('selected'));
            document.querySelector('.color-picker .color-option').classList.add('selected');
            selectedLabelColor = '#61bd4f';
            
            // Reload labels list
            loadLabelsForModal();
            
            showNotification('Label created successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Error creating label:', error);
        showNotification('Failed to create label: ' + error.message, 'error');
    }
}

async function toggleLabel(labelId, cardId) {
    if (!cardId) return;
    
    try {
        // Check if label is currently assigned
        const existingAssignment = window.db.findBy('card_labels', { 
            card_id: parseInt(cardId), 
            label_id: parseInt(labelId) 
        });
        
        if (existingAssignment.length > 0) {
            // Remove label
            window.db.delete('card_labels', existingAssignment[0].id);
            showNotification('Label removed from card', 'info');
        } else {
            // Add label
            window.db.insert('card_labels', {
                card_id: parseInt(cardId),
                label_id: parseInt(labelId)
            });
            showNotification('Label added to card', 'success');
        }
        
        // Reload labels list to update UI
        loadLabelsForModal();
        
        // Refresh the card display to show new labels
        displayCardLabels();
        
    } catch (error) {
        console.error('Error toggling label:', error);
        showNotification('Failed to toggle label', 'error');
    }
}

// Delete label functionality with modal confirmation
let deletingLabelId = null;

async function deleteLabel(labelId) {
    // Get the label data to show preview
    const label = window.db.findById('labels', parseInt(labelId));
    if (!label) {
        showNotification('Label not found', 'error');
        return;
    }
    
    deletingLabelId = labelId;
    
    // Show the delete confirmation modal
    const modal = document.getElementById('delete-label-modal');
    const titleElement = document.getElementById('deleteLabelTitle');
    
    if (modal && titleElement) {
        titleElement.textContent = `Delete "${label.name}"?`;
        
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeDeleteLabelModal() {
    const modal = document.getElementById('delete-label-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    deletingLabelId = null;
}

async function confirmDeleteLabel() {
    if (!deletingLabelId) {
        showNotification('No label selected for deletion', 'error');
        return;
    }
    
    try {
        // Remove all card-label associations first
        window.db.deleteBy('card_labels', { label_id: parseInt(deletingLabelId) });
        
        // Delete the label itself
        window.db.delete('labels', parseInt(deletingLabelId));
        
        showNotification('Label deleted successfully', 'success');
        
        // Close the delete modal
        closeDeleteLabelModal();
        
        // Reload labels list
        loadLabelsForModal();
        
        // Refresh the board to show updated labels
        renderLists();
        
    } catch (error) {
        console.error('Error deleting label:', error);
        showNotification('Failed to delete label', 'error');
    }
}

function closeLabelsModal() {
    const modal = document.getElementById('labels-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Edit label functionality
let editingLabelId = null;
let editSelectedLabelColor = '#61bd4f';

function openEditLabelModal(labelId) {
    console.log('Opening edit label modal for label:', labelId);
    
    // Get the label data
    const label = window.db.findById('labels', parseInt(labelId));
    if (!label) {
        showNotification('Label not found', 'error');
        return;
    }
    
    editingLabelId = labelId;
    editSelectedLabelColor = label.color;
    
    const modal = document.getElementById('edit-label-modal');
    if (!modal) {
        console.error('Edit label modal not found');
        return;
    }
    
    // Populate the form
    const nameInput = document.getElementById('editLabelName');
    const nameCounter = document.getElementById('editLabelCounter');
    
    if (nameInput) {
        nameInput.value = label.name;
        
        // Set up character counter for edit input
        if (nameCounter) {
            // Remove existing event listener if any
            nameInput.removeEventListener('input', updateEditLabelCounter);
            nameInput.addEventListener('input', updateEditLabelCounter);
            
            // Initialize counter display
            updateEditLabelCounter.call(nameInput);
        }
    }
    
    // Set up color picker for edit modal
    const editColorPicker = document.getElementById('editColorPicker');
    if (editColorPicker) {
        // Remove existing listeners
        editColorPicker.querySelectorAll('.color-option').forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
        });
        
        // Add new listeners
        editColorPicker.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                editColorPicker.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                editSelectedLabelColor = this.getAttribute('data-color');
            });
            
            // Select the current color
            if (option.getAttribute('data-color') === label.color) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // Show the modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Focus the name input
    setTimeout(() => {
        if (nameInput) nameInput.focus();
    }, 100);
}

function closeEditLabelModal() {
    const modal = document.getElementById('edit-label-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    editingLabelId = null;
    editSelectedLabelColor = '#61bd4f';
}

async function saveEditLabel() {
    if (!editingLabelId) {
        showNotification('No label selected for editing', 'error');
        return;
    }
    
    const nameInput = document.getElementById('editLabelName');
    if (!nameInput) {
        console.error('Edit label name input not found');
        return;
    }
    
    const name = nameInput.value.trim();
    
    if (!name) {
        showNotification('Please enter a label name', 'error');
        return;
    }
    
    if (name.length > 13) {
        showNotification('Label name cannot exceed 13 characters', 'error');
        return;
    }
    
    try {
        const success = window.db.update('labels', parseInt(editingLabelId), {
            name: name,
            color: editSelectedLabelColor
        });
        
        if (success) {
            showNotification('Label updated successfully!', 'success');
            
            // Close edit modal
            closeEditLabelModal();
            
            // Reload labels list in the main labels modal
            loadLabelsForModal();
            
            // Refresh the board to show updated labels
            renderLists();
        } else {
            showNotification('Failed to update label', 'error');
        }
        
    } catch (error) {
        console.error('Error updating label:', error);
        showNotification('Failed to update label: ' + error.message, 'error');
    }
}

// Checklist modal functionality
function openChecklistModal() {
    console.log('Opening checklist modal...');
    const modal = document.getElementById('checklist-modal');
    if (!modal) {
        console.error('Checklist modal not found');
        return;
    }
    
    // Show the modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // Initialize checklist modal
    loadChecklistItems();
}

async function loadChecklistItems() {
    const cardId = window.currentCardId;
    const itemsList = document.getElementById('checklistItems');
    
    if (!cardId) {
        if (itemsList) {
            itemsList.innerHTML = '<p class="no-items">No card selected.</p>';
        }
        return;
    }
    
    if (itemsList) {
        itemsList.innerHTML = '<div class="loading">Loading checklist items...</div>';
    }
    
    try {
        // Get checklist items from JavaScript database
        const items = window.db.findBy('checklist_items', { card_id: parseInt(cardId) });
        
        if (itemsList) {
            itemsList.innerHTML = '';
            
            if (items.length === 0) {
                itemsList.innerHTML = '';
            } else {
                items.forEach((item, index) => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'checklist-item';
                    itemElement.setAttribute('data-item-id', item.id);
                    itemElement.innerHTML = `
                        <div class="item-checkbox">
                            <input type="checkbox" id="item-${item.id}" ${item.is_completed ? 'checked' : ''} 
                                   onchange="toggleChecklistItem(${item.id})">
                            <label for="item-${item.id}"></label>
                        </div>
                        <div class="item-content ${item.is_completed ? 'completed' : ''}">
                            <span class="item-text">${escapeHtml(item.content)}</span>
                        </div>
                        <div class="item-actions">
                            <button class="btn-icon btn-danger" onclick="deleteChecklistItem(${item.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    itemsList.appendChild(itemElement);
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading checklist items:', error);
        if (itemsList) {
            itemsList.innerHTML = '<p class="no-items error">Failed to load checklist items. Please try again.</p>';
        }
        showNotification('Failed to load checklist items', 'error');
    }
}

async function addChecklistItem() {
    const textArea = document.getElementById('newChecklistItem');
    if (!textArea) {
        console.error('Checklist item input not found');
        return;
    }
    
    const text = textArea.value.trim();
    
    if (!text) {
        showNotification('Please enter item text', 'error');
        return;
    }
    
    const cardId = window.currentCardId;
    
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }
    
    try {
        // Get current item count to set position
        const existingItems = window.db.findBy('checklist_items', { card_id: parseInt(cardId) });
        const position = existingItems.length;
        
        const result = window.db.insert('checklist_items', {
            card_id: parseInt(cardId),
            content: text,
            is_completed: false,
            position: position
        });
        
        if (result) {
            textArea.value = '';
            
            // Reload checklist items in modal
            loadChecklistItems();
            
            // Update checklist progress
            updateChecklistProgress();
            
            // Refresh board to update progress bars
            renderLists();
            
            showNotification('Checklist item added', 'success');
        }
        
    } catch (error) {
        console.error('Error adding checklist item:', error);
        showNotification('Failed to add checklist item', 'error');
    }
}

async function toggleChecklistItem(itemId) {
    try {
        const item = window.db.findById('checklist_items', itemId);
        if (!item) {
            showNotification('Checklist item not found', 'error');
            return;
        }
        
        // Toggle completion status
        const newStatus = !item.is_completed;
        window.db.update('checklist_items', itemId, {
            is_completed: newStatus
        });
        
        // Update UI
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
            const contentElement = itemElement.querySelector('.item-content');
            if (newStatus) {
                contentElement.classList.add('completed');
            } else {
                contentElement.classList.remove('completed');
            }
        }
        
        // Update checklist progress
        updateChecklistProgress();
        
        // Refresh board to update progress bars
        renderLists();
        
        showNotification(`Item marked as ${newStatus ? 'completed' : 'incomplete'}`, 'success');
        
    } catch (error) {
        console.error('Error toggling checklist item:', error);
        showNotification('Failed to update checklist item', 'error');
    }
}

async function deleteChecklistItem(itemId) {
    // Show delete confirmation modal instead of window.confirm
    openDeleteChecklistItemModal(itemId);
}

function closeChecklistModal() {
    const modal = document.getElementById('checklist-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Save all card changes
async function saveAllCardChanges() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }

    try {
        // Gather all form data
        const title = document.getElementById('cardTitleEdit')?.value || '';
        const description = document.getElementById('cardDescription')?.value || '';
        const dueDate = document.getElementById('cardDueDate')?.value || '';
        const dueTime = document.getElementById('cardDueTime')?.value || '';

        // Combine date and time if both exist
        let due_date = null;
        if (dueDate && dueTime) {
            due_date = `${dueDate} ${dueTime}:00`;
        } else if (dueDate) {
            due_date = `${dueDate} 00:00:00`;
        }

        // Validate deadline is not in the past (Manila time)
        if (due_date) {
            const deadlineDateTime = new Date(due_date);
            const now = new Date();
            
            // Convert to Manila time for comparison
            const manilaOffset = 8 * 60; // UTC+8 in minutes
            const nowManila = new Date(now.getTime() + (manilaOffset * 60000));
            const deadlineManila = new Date(deadlineDateTime.getTime() + (manilaOffset * 60000));
            
            if (deadlineManila <= nowManila) {
                showNotification('Deadline cannot be set in the past', 'error');
                return;
            }
        }

        // Update card
        const response = await window.api.updateCard({
            card_id: cardId,
            title: title,
            description: description,
            due_date: due_date
        });

        if (response.success) {
            // Save checklist changes
            await saveChecklistChanges(cardId);
            
            showNotification('All changes saved successfully!', 'success');
            // Refresh the board display
            renderLists();
        } else {
            showNotification('Failed to update card: ' + response.message, 'error');
        }
    } catch (error) {
        console.error('Error saving card changes:', error);
        showNotification('Failed to save changes', 'error');
    }
}

// Save checklist changes to database
async function saveChecklistChanges(cardId) {
    try {
        // Add new items
        if (window.tempChecklistChanges.added && window.tempChecklistChanges.added.length > 0) {
            for (const item of window.tempChecklistChanges.added) {
                const newItem = {
                    card_id: cardId,
                    content: item.content,
                    is_completed: item.is_completed,
                    position: item.position
                };
                window.db.insert('checklist_items', newItem);
            }
        }
        
        // Delete marked items
        if (window.tempChecklistChanges.deleted && window.tempChecklistChanges.deleted.length > 0) {
            for (const itemId of window.tempChecklistChanges.deleted) {
                window.db.delete('checklist_items', itemId);
            }
        }
        
        // Update toggled items
        if (window.tempChecklistChanges.toggled && window.tempChecklistChanges.toggled.length > 0) {
            for (const item of window.tempChecklistChanges.toggled) {
                window.db.update('checklist_items', item.id, {
                    is_completed: item.is_completed
                });
            }
        }
        
        // Clear temporary changes
        window.tempChecklistChanges = {
            added: [],
            deleted: [],
            toggled: []
        };
        
        console.log('Checklist changes saved successfully');
        
        // After saving, check if all checklist items are complete and auto-complete card if needed
        // This only happens when user clicks "Save Changes" button
        const allItems = window.db.findBy('checklist_items', { card_id: cardId });
        if (allItems && allItems.length > 0) {
            const completedItems = allItems.filter(item => 
                !!(item.is_completed && item.is_completed !== 0 && item.is_completed !== '0' && item.is_completed !== false)
            );
            
            if (completedItems.length === allItems.length) {
                // All checklist items are complete, auto-complete the card
                await autoCompleteCard();
            } else {
                // Not all items complete, auto-incomplete the card if it was completed
                await autoIncompleteCard();
            }
        }
    } catch (error) {
        console.error('Error saving checklist changes:', error);
        throw error;
    }
}

// Toggle card completion status
async function toggleCardComplete() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }

    try {
        // Get current card data
        const response = await window.api.getCardDetails(cardId);
        if (!response.success) {
            showNotification('Failed to get card details', 'error');
            return;
        }

        const currentCard = response.data.card;
        const isCompleted = !!(currentCard.is_completed === 1 || currentCard.is_completed === true);
        
        // Toggle completion status
        const updateResponse = await window.api.updateCard({
            card_id: cardId,
            is_completed: !isCompleted
        });

        if (updateResponse.success) {
            const newStatus = !isCompleted; // The new status after toggle
            const statusText = newStatus ? 'complete' : 'incomplete';
            showNotification(`Card marked as ${statusText}`, 'success');
            
            // Update React component state instead of DOM manipulation
            if (window.updateCardCompletionState) {
                window.updateCardCompletionState(newStatus);
            }
            
            // Refresh the board display
            renderLists();
        } else {
            showNotification('Failed to update card status: ' + updateResponse.message, 'error');
        }
    } catch (error) {
        console.error('Error toggling card completion:', error);
        showNotification('Failed to update card status', 'error');
    }
}

// Confirm card deletion
function deleteCardConfirm() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }
    
    // Get card details
    const card = window.db.findById('cards', parseInt(cardId));
    if (!card) {
        showNotification('Card not found', 'error');
        return;
    }
    
    // Show modal
    const modal = document.getElementById('delete-card-modal');
    const cardName = document.getElementById('deleteCardName');
    
    if (modal && cardName) {
        cardName.textContent = card.title || 'Untitled Card';
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

async function deleteCard() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }
    
    try {
        const response = await window.api.deleteCard(cardId);
        
        if (response.success) {
            showNotification('Card deleted successfully', 'success');
            closeCardModal();
            
            // Refresh the board to remove the deleted card
            renderLists();
        } else {
            showNotification('Failed to delete card: ' + response.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Failed to delete card', 'error');
    }
}

// Close delete card modal
function closeDeleteCardModal() {
    const modal = document.getElementById('delete-card-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Confirm delete card
function confirmDeleteCard() {
    closeDeleteCardModal();
    deleteCard();
}

// Initialize list menu functionality
function initializeListMenus() {
    console.log('Initializing list menus...');
    const listMenuBtns = document.querySelectorAll('.list-menu-btn');
    console.log('Found list menu buttons:', listMenuBtns.length);

    listMenuBtns.forEach((btn, index) => {
        console.log(`Setting up list menu button ${index}:`, btn);
        btn.removeEventListener('click', handleListMenuClick);
        btn.addEventListener('click', handleListMenuClick);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', closeListDropdownOnOutsideClick);
}

// Handle list menu click
function handleListMenuClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('List menu button clicked');
    
    const listId = e.currentTarget.getAttribute('data-list-id');
    if (listId) {
        showListDropdown(e.currentTarget, listId);
    } else {
        console.error('No list ID found on list menu button');
    }
}

// Show list dropdown menu
function showListDropdown(buttonElement, listId) {
    const dropdown = document.getElementById('listMenuDropdown');
    if (!dropdown) {
        console.error('List menu dropdown not found');
        return;
    }

    // Store the current list ID
    dropdown.setAttribute('data-list-id', listId);

    // Position the dropdown
    const rect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 5) + 'px';
    dropdown.style.left = (rect.left - 120) + 'px'; // Offset to align properly
    dropdown.style.display = 'block';

    // Add active class to button
    buttonElement.classList.add('active');

    // Setup dropdown button event listeners
    const renameBtn = document.getElementById('renameListBtn');
    const deleteBtn = document.getElementById('deleteListBtn');

    if (renameBtn) {
        renameBtn.onclick = () => {
            console.log('Rename button clicked for list:', listId);
            openRenameListModal(listId);
        };
    }
    
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            console.log('Delete button clicked for list:', listId);
            confirmDeleteList(listId);
        };
    }
}

// Close dropdown on outside click
function closeListDropdownOnOutsideClick(e) {
    const dropdown = document.getElementById('listMenuDropdown');
    if (!dropdown || dropdown.style.display === 'none') return;

    if (!dropdown.contains(e.target) && !e.target.closest('.list-menu-btn')) {
        closeListDropdown();
    }
}

// Close list dropdown
function closeListDropdown() {
    const dropdown = document.getElementById('listMenuDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.removeAttribute('data-list-id');
    }

    // Remove active class from all list menu buttons
    document.querySelectorAll('.list-menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Manila clock
function startManilaClock() {
    const el = document.getElementById('manila-clock');
    if (!el) return;

    function update() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const manila = new Date(utc + (3600000 * 8));

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateStr = manila.toLocaleDateString(undefined, options);
        const timeStr = manila.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        el.textContent = `Manila: ${dateStr} ${timeStr}`;
    }

    update();
    setInterval(update, 1000);
}

// Board title editing
function initializeBoardTitleEditing() {
    const boardTitle = document.querySelector('.board-title');
    if (boardTitle) {
        boardTitle.addEventListener('click', editBoardTitle);
    }
}

// Show attachment upload functionality
function showAttachmentUpload() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }
    
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '*/*';
    
    fileInput.onchange = function(event) {
        const files = event.target.files;
        if (files.length > 0) {
            uploadAttachments(cardId, files);
        }
    };
    
    fileInput.click();
}

// Upload attachments
async function uploadAttachments(cardId, files) {
    try {
        console.log('Uploading attachments for card ID:', cardId, 'type:', typeof cardId);
        showNotification('Uploading attachments...', 'info');
        
        for (const file of files) {
            console.log('Processing file:', file.name, 'size:', file.size);
            // Simulate file upload - in a real app, you'd upload to a server
            const attachment = {
                id: Date.now() + Math.random(), // Generate unique ID
                card_id: parseInt(cardId), // Ensure it's an integer
                filename: file.name,
                file_size: file.size,
                file_type: file.type,
                file_data: await fileToBase64(file), // Store as base64 for demo
                created_at: new Date().toISOString(),
                uploaded_by: window.api.currentUser?.id || 1
            };
            
            console.log('Attachment object:', { ...attachment, file_data: '[base64 data]' });
            
            // Save to database
            const result = window.db.insert('attachments', attachment);
            console.log('Attachment insert result:', result);
            if (result && result.id) {
                console.log('Attachment saved successfully:', attachment.filename, 'with ID:', result.id);
            }
        }
        
        showNotification(`${files.length} attachment(s) uploaded successfully`, 'success');
        
        // Refresh the card display
        openCardModal(cardId);
        
    } catch (error) {
        console.error('Error uploading attachments:', error);
        showNotification('Failed to upload attachments', 'error');
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Download attachment
async function downloadAttachment(attachmentId) {
    try {
        const attachment = window.db.findById('attachments', attachmentId);
        if (!attachment) {
            showNotification('Attachment not found', 'error');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = attachment.file_data;
        link.download = attachment.filename;
        link.click();
        
        showNotification('Download started', 'success');
        
    } catch (error) {
        console.error('Error downloading attachment:', error);
        showNotification('Failed to download attachment', 'error');
    }
}

// Delete attachment
async function deleteAttachment(attachmentId) {
    try {
        const attachment = window.db.findById('attachments', attachmentId);
        if (!attachment) {
            showNotification('Attachment not found', 'error');
            return;
        }
        
        // Show confirmation modal
        showDeleteAttachmentModal(attachmentId, attachment.filename);
        
    } catch (error) {
        console.error('Error preparing to delete attachment:', error);
        showNotification('Failed to delete attachment', 'error');
    }
}

// Show delete attachment confirmation modal
function showDeleteAttachmentModal(attachmentId, filename) {
    const modal = document.getElementById('delete-attachment-modal');
    if (!modal) {
        showNotification('Delete attachment modal not found', 'error');
        return;
    }
    
    // Update modal content
    const attachmentName = modal.querySelector('#deleteAttachmentName');
    if (attachmentName) {
        attachmentName.textContent = filename || 'Unknown file';
    }
    
    // Set up confirmation button
    const confirmBtn = modal.querySelector('#confirmDeleteAttachment');
    if (confirmBtn) {
        confirmBtn.onclick = () => confirmDeleteAttachment(attachmentId);
    }
    
    // Add ESC key handler
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteAttachmentModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Show modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Note: Delete attachment modal is now in Board.jsx - no need to create dynamically

// Close delete attachment modal
function closeDeleteAttachmentModal() {
    const modal = document.getElementById('delete-attachment-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Confirm delete attachment
async function confirmDeleteAttachment(attachmentId) {
    try {
        const result = window.db.delete('attachments', attachmentId);
        if (result) {
            showNotification('Attachment deleted successfully', 'success');
            closeDeleteAttachmentModal();
            
            // Refresh the card display
            if (window.currentCardId) {
                openCardModal(window.currentCardId);
            }
        } else {
            showNotification('Failed to delete attachment', 'error');
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        showNotification('Failed to delete attachment', 'error');
    }
}

// Save card title
async function saveCardTitle() {
    const cardId = window.currentCardId;
    if (!cardId) {
        showNotification('No card selected', 'error');
        return;
    }
    
    const titleInput = document.getElementById('cardTitleEdit');
    if (!titleInput) {
        showNotification('Title field not found', 'error');
        return;
    }
    
    const title = titleInput.value.trim();
    if (!title) {
        showNotification('Card title cannot be empty', 'error');
        return;
    }
    
    try {
        const response = await window.api.updateCard({
            card_id: cardId,
            title: title
        });
        
        if (response.success) {
            showNotification('Title saved successfully', 'success');
            
            // Update the card in the DOM
            const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) {
                const cardTitle = cardElement.querySelector('.card-title');
                if (cardTitle) {
                    cardTitle.textContent = title;
                }
            }
        } else {
            showNotification('Failed to save title: ' + response.message, 'error');
        }
    } catch (error) {
        console.error('Error saving title:', error);
        showNotification('Failed to save title', 'error');
    }
}

// Make function available globally for potential future use
window.saveCardTitle = saveCardTitle;

// Auto-save card description (without showing notifications)
async function autoSaveCardDescription() {
    const cardId = window.currentCardId;
    if (!cardId) return;
    
    const descriptionTextarea = document.getElementById('cardDescription');
    if (!descriptionTextarea) return;
    
    const description = descriptionTextarea.value.trim();
    
    try {
        const response = await window.api.updateCard({
            card_id: cardId,
            description: description
        });
        
        if (response.success) {
            console.log('Description auto-saved successfully');
        } else {
            console.error('Failed to auto-save description:', response.message);
        }
    } catch (error) {
        console.error('Error auto-saving description:', error);
    }
}

// Make function available globally for potential future use
window.autoSaveCardDescription = autoSaveCardDescription;

// Rename list functionality
function openRenameListModal(listId) {
    console.log('Opening rename modal for list:', listId);
    closeListDropdown();
    
    const list = window.db.findById('lists', parseInt(listId));
    if (!list) {
        showNotification('List not found', 'error');
        return;
    }

    const modal = document.getElementById('renameListModal');
    const input = document.getElementById('renameListInput');
    
    console.log('Modal found:', !!modal, 'Input found:', !!input);
    
    if (modal && input) {
        input.value = list.title;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Store the list ID on the modal
        modal.setAttribute('data-list-id', listId);
        
        // Focus the input
        setTimeout(() => input.focus(), 100);
    }
}

function closeRenameListModal() {
    const modal = document.getElementById('renameListModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        modal.removeAttribute('data-list-id');
    }
}

function saveListRename() {
    const modal = document.getElementById('renameListModal');
    const input = document.getElementById('renameListInput');
    
    if (!modal || !input) return;
    
    const listId = modal.getAttribute('data-list-id');
    const newTitle = input.value.trim();
    
    if (!newTitle) {
        showNotification('Please enter a list name', 'error');
        return;
    }
    
    if (!listId) {
        showNotification('List ID not found', 'error');
        return;
    }

    try {
        // Update the list in database
        const success = window.db.update('lists', parseInt(listId), { title: newTitle });
        
        if (success) {
            showNotification('List renamed successfully', 'success');
            closeRenameListModal();
            renderLists(); // Re-render lists to show the new name
        } else {
            showNotification('Failed to rename list', 'error');
        }
    } catch (error) {
        console.error('Error renaming list:', error);
        showNotification('Failed to rename list', 'error');
    }
}

// Delete list functionality
function confirmDeleteList(listId) {
    console.log('Confirming delete for list:', listId);
    closeListDropdown();
    
    const list = window.db.findById('lists', parseInt(listId));
    if (!list) {
        showNotification('List not found', 'error');
        return;
    }

    // Show confirmation modal
    const modal = document.getElementById('deleteConfirmationModal');
    const titleElement = document.getElementById('deleteConfirmationTitle');
    const messageElement = document.getElementById('deleteConfirmationMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    console.log('Delete modal elements found:', {
        modal: !!modal,
        title: !!titleElement,
        message: !!messageElement,
        confirmBtn: !!confirmBtn
    });
    
    if (modal && titleElement && messageElement && confirmBtn) {
        titleElement.textContent = `Delete "${list.title}"?`;
        messageElement.textContent = 'This will permanently delete the list and all its cards. This action cannot be undone.';
        
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Set up delete confirmation
        confirmBtn.onclick = () => deleteList(listId);
        
        // Set up cancel button
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        if (cancelBtn) {
            cancelBtn.onclick = closeDeleteConfirmationModal;
        }
        
        // Set up close modal handlers
        const closeModalBtns = modal.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.onclick = closeDeleteConfirmationModal;
        });
    }
}

function closeDeleteConfirmationModal() {
    const modal = document.getElementById('deleteConfirmationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function closeDeleteListModal() {
    const modal = document.getElementById('deleteListModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function deleteList(listId) {
    try {
        // First, delete all cards in the list
        const cards = window.db.findBy('cards', { list_id: parseInt(listId) });
        cards.forEach(card => {
            // Delete card-related data
            window.db.deleteBy('comments', { card_id: card.id });
            window.db.deleteBy('checklist_items', { card_id: card.id });
            window.db.deleteBy('card_labels', { card_id: card.id });
            window.db.deleteBy('attachments', { card_id: card.id });
            
            // Delete the card itself
            window.db.delete('cards', card.id);
        });
        
        // Then delete the list
        const success = window.db.delete('lists', parseInt(listId));
        
        if (success) {
            showNotification('List deleted successfully', 'success');
            closeDeleteConfirmationModal();
            renderLists(); // Re-render lists to remove the deleted list
        } else {
            showNotification('Failed to delete list', 'error');
        }
    } catch (error) {
        console.error('Error deleting list:', error);
        showNotification('Failed to delete list', 'error');
    }
}

// Format due date display
function formatDueDateDisplay(dueDateString, isCompleted = false) {
    if (!dueDateString) return '';
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    
    // If task is completed, show completed status
    if (isCompleted) {
        return 'COMPLETED';
    }
    
    // Calculate time difference
    const timeDiff = dueDate.getTime() - now.getTime();
    
    // If overdue
    if (timeDiff < 0) {
        const overdueDiff = Math.abs(timeDiff);
        const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        let overdueText = 'Overdue';
        if (days > 0) {
            overdueText += ` by ${days}d ${hours}h`;
        } else if (hours > 0) {
            overdueText += ` by ${hours}h ${minutes}m`;
        } else {
            overdueText += ` by ${minutes}m`;
        }
        
        return overdueText;
    }
    
    // Calculate countdown
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    let countdownText = '';
    
    if (days > 0) {
        countdownText = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        countdownText = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        countdownText = `${minutes}m ${seconds}s`;
    } else {
        countdownText = `${seconds}s`;
    }
    
    return countdownText;
}

// Function to get countdown status class for styling
function getCountdownStatusClass(dueDateString, isCompleted = false) {
    if (!dueDateString) return '';
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    
    if (isCompleted) {
        return 'completed';
    } else if (timeDiff < 0) {
        return 'overdue';
    } else if (timeDiff < 24 * 60 * 60 * 1000) { // Less than 24 hours
        return 'urgent';
    } else if (timeDiff < 3 * 24 * 60 * 60 * 1000) { // Less than 3 days
        return 'warning';
    } else {
        return 'normal';
    }
}

// Board title editing functions
function editBoardTitle() {
    const titleSection = document.querySelector('.board-title-section');
    const titleText = document.getElementById('boardTitleText');
    const titleEditForm = document.querySelector('.title-edit-form');
    const titleInput = document.getElementById('boardTitleInput');
    
    if (titleSection && titleText && titleEditForm && titleInput) {
        titleText.style.display = 'none';
        titleEditForm.style.display = 'flex';
        titleInput.value = titleText.textContent;
        titleInput.focus();
        titleInput.select();
    }
}

function saveBoardTitle() {
    const titleText = document.getElementById('boardTitleText');
    const titleEditForm = document.querySelector('.title-edit-form');
    const titleInput = document.getElementById('boardTitleInput');
    const boardTitle = document.getElementById('boardTitle');
    
    if (titleText && titleEditForm && titleInput && boardTitle) {
        const newTitle = titleInput.value.trim();
        if (newTitle) {
            titleText.textContent = newTitle;
            
            // Update in database
            const boardId = boardTitle.getAttribute('data-board-id');
            if (window.db && boardId) {
                window.db.update('boards', parseInt(boardId), { title: newTitle });
            }
        }
        
        cancelTitleEdit();
    }
}

function cancelTitleEdit() {
    const titleText = document.getElementById('boardTitleText');
    const titleEditForm = document.querySelector('.title-edit-form');
    
    if (titleText && titleEditForm) {
        titleText.style.display = 'inline';
        titleEditForm.style.display = 'none';
    }
}

function showBoardStatistics() {
    console.log("Show board statistics clicked");
    
    // Calculate statistics
    const stats = calculateBoardStatistics();
    
    // Update modal content
    updateStatisticsModal(stats);
    
    // Show modal
    const modal = document.getElementById('board-statistics-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

// Close board statistics modal
function closeBoardStatistics() {
    const modal = document.getElementById('board-statistics-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

// Calculate comprehensive board statistics
function calculateBoardStatistics() {
    if (!window.db) return null;
    
    const lists = window.db.findBy('lists', { board_id: 1 });
    const allCards = window.db.findBy('cards', {});
    let allChecklistItems = window.db.findBy('checklist_items', {});
    
    // Apply temporary checklist changes if they exist
    if (window.tempChecklistChanges) {
        // Filter out deleted items
        if (window.tempChecklistChanges.deleted) {
            allChecklistItems = allChecklistItems.filter(item => 
                !window.tempChecklistChanges.deleted.includes(item.id)
            );
        }
        
        // Add temporary items
        if (window.tempChecklistChanges.added) {
            allChecklistItems = [...allChecklistItems, ...window.tempChecklistChanges.added];
        }
        
        // Apply toggle changes
        if (window.tempChecklistChanges.toggled) {
            allChecklistItems = allChecklistItems.map(item => {
                const toggledItem = window.tempChecklistChanges.toggled.find(t => t.id === item.id);
                if (toggledItem) {
                    return { ...item, is_completed: toggledItem.is_completed };
                }
                return item;
            });
        }
    }
    
    let totalCards = 0;
    let completedCards = 0;
    let cardsWithFullChecklists = 0;
    let totalChecklistItems = 0;
    let completedChecklistItems = 0;
    
    const listStats = lists.map(list => {
        const listCards = allCards.filter(card => card.list_id === list.id);
        const listCompletedCards = listCards.filter(card => card.is_completed === 1 || card.is_completed === true);
        
        const cardDetails = listCards.map(card => {
            const cardChecklistItems = allChecklistItems.filter(item => item.card_id === card.id);
            // Check if is_completed is truthy (1, true, "1", etc.) but not falsy (0, false, "0", "", null, undefined)
            const cardCompletedItems = cardChecklistItems.filter(item => {
                const val = item.is_completed;
                // Check if it's truthy and not explicitly false/0/"0"
                return val === 1 || val === true || val === "1" || val === '1';
            });
            
            console.log('Card:', card.title);
            console.log('Total checklist items:', cardChecklistItems.length);
            console.log('Completed items:', cardCompletedItems.length);
            if (cardChecklistItems.length > 0) {
                console.log('Sample item:', JSON.stringify(cardChecklistItems[0]));
            }
            
            totalChecklistItems += cardChecklistItems.length;
            completedChecklistItems += cardCompletedItems.length;
            
            const checklistCompletion = cardChecklistItems.length > 0 ? 
                Math.round((cardCompletedItems.length / cardChecklistItems.length) * 100) : 0;
            
            if (cardChecklistItems.length > 0 && cardCompletedItems.length === cardChecklistItems.length) {
                cardsWithFullChecklists++;
            }
            
            let status = 'not-started';
            if (card.is_completed === 1 || card.is_completed === true) {
                status = 'completed';
            } else if (cardCompletedItems.length > 0) {
                status = 'in-progress';
            }
            
            return {
                name: card.title,
                checklistItems: cardChecklistItems.length,
                completedItems: cardCompletedItems.length,
                checklistCompletion,
                status,
                isCompleted: card.is_completed === 1 || card.is_completed === true
            };
        });
        
        totalCards += listCards.length;
        completedCards += listCompletedCards.length;
        
        return {
            name: list.title,
            totalCards: listCards.length,
            completedCards: listCompletedCards.length,
            completionRate: listCards.length > 0 ? Math.round((listCompletedCards.length / listCards.length) * 100) : 0,
            cards: cardDetails
        };
    });
    
    // Card completion rate based on cards marked as completed, not checklist completion
    const cardCompletionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
    const overallChecklistProgress = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;
    
    console.log('=== STATISTICS CALCULATION ===');
    console.log('Total checklist items:', totalChecklistItems);
    console.log('Completed checklist items:', completedChecklistItems);
    console.log('Overall checklist progress:', overallChecklistProgress + '%');
    console.log('==============================');
    
    return {
        cardCompletionRate,
        completedCards,
        totalCards,
        cardsWithFullChecklists,
        overallChecklistProgress,
        completedChecklistItems,
        totalChecklistItems,
        listStats
    };
}

// Update statistics modal with calculated data
function updateStatisticsModal(stats) {
    if (!stats) return;
    
    console.log('Updating statistics modal with:', stats);
    
    // Update overview cards
    document.getElementById('cardCompletionRate').textContent = `${stats.cardCompletionRate}%`;
    const cardCompletionDesc = document.getElementById('completedCardsDesc');
    if (cardCompletionDesc) {
        cardCompletionDesc.textContent = `Cards with 100% checklists done`;
    }
    
    document.getElementById('completedCards').textContent = stats.completedCards;
    document.getElementById('completedCardsDesc').textContent = `Out of ${stats.totalCards} total cards`;
    
    const checklistProgressElement = document.getElementById('checklistProgress');
    const checklistProgressDescElement = document.getElementById('checklistProgressDesc');
    
    console.log('Setting checklistProgress to:', `${stats.overallChecklistProgress}%`);
    console.log('checklistProgress element:', checklistProgressElement);
    
    if (checklistProgressElement) {
        checklistProgressElement.textContent = `${stats.overallChecklistProgress}%`;
    } else {
        console.error('checklistProgress element not found!');
    }
    
    if (checklistProgressDescElement) {
        checklistProgressDescElement.textContent = `${stats.completedChecklistItems}/${stats.totalChecklistItems} individual checklists`;
    } else {
        console.error('checklistProgressDesc element not found!');
    }
    
    // Update detailed progress by list
    const container = document.getElementById('listProgressContainer');
    if (!container) return;
    
    container.innerHTML = stats.listStats.map(list => `
        <div class="list-progress-item">
            <div class="list-progress-header">
                <div class="list-name">${escapeHtml(list.name)}</div>
                <div class="list-stats">
                    ${list.totalCards} cards • ${list.completionRate}% cards completed • (${list.completedCards}/${list.totalCards})
                </div>
            </div>
            <div class="list-progress-body">
                ${list.cards.map(card => `
                    <div class="card-progress-item ${card.status}">
                        <div class="card-name">${escapeHtml(card.name)}</div>
                        <div class="card-checklist-info">${card.completedItems}/${card.checklistItems} checklists (${card.checklistCompletion}%)</div>
                        <div class="progress-bar-mini">
                            <div class="progress-fill" style="width: ${card.checklistCompletion}%"></div>
                        </div>
                        <div class="card-status-badge ${card.status}">
                            ${card.status === 'completed' ? 'Completed' : 
                              card.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Update user avatar
function updateUserAvatar(user) {
    const userAvatar = document.querySelector('.profile-avatar');
    if (userAvatar && user) {
        userAvatar.textContent = user.avatar || user.first_name.charAt(0);
        if (user.avatar_color) {
            userAvatar.style.backgroundColor = user.avatar_color;
        }
    }
}

// Escape HTML for security
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Note: showNotification function is provided by shared.js which loads before this file
/* global showNotification */

// Make functions globally accessible
window.initializeBoard = initializeBoard;
window.openCardModal = openCardModal;
window.closeCardModal = closeCardModal;
window.handleAddCard = handleAddCard;
window.closeModal = closeModal;
window.openLabelsModal = openLabelsModal;
window.closeLabelsModal = closeLabelsModal;
window.createLabel = createLabel;
window.toggleLabel = toggleLabel;
window.deleteLabel = deleteLabel;
window.closeDeleteLabelModal = closeDeleteLabelModal;
window.confirmDeleteLabel = confirmDeleteLabel;
window.openEditLabelModal = openEditLabelModal;
window.closeEditLabelModal = closeEditLabelModal;
window.saveEditLabel = saveEditLabel;
window.openChecklistModal = openChecklistModal;
window.closeChecklistModal = closeChecklistModal;
window.addChecklistItem = addChecklistItem;
window.toggleChecklistItem = toggleChecklistItem;
window.deleteChecklistItem = deleteChecklistItem;
window.showAddItemForm = showAddItemForm;
window.cancelAddItem = cancelAddItem;
window.addChecklistItemInline = addChecklistItemInline;
window.toggleChecklistItemInline = toggleChecklistItemInline;
window.deleteChecklistItemInline = deleteChecklistItemInline;
window.openEditChecklistItemModal = openEditChecklistItemModal;
window.closeEditChecklistItemModal = closeEditChecklistItemModal;
window.saveChecklistItemEdit = saveChecklistItemEdit;
window.openDeleteChecklistItemModal = openDeleteChecklistItemModal;
window.closeDeleteChecklistItemModal = closeDeleteChecklistItemModal;
window.confirmDeleteChecklistItem = confirmDeleteChecklistItem;
window.updateChecklistProgress = updateChecklistProgress;
window.saveAllCardChanges = saveAllCardChanges;
window.toggleCardComplete = toggleCardComplete;
window.deleteCardConfirm = deleteCardConfirm;
window.showAttachmentUpload = showAttachmentUpload;
window.downloadAttachment = downloadAttachment;
window.deleteAttachment = deleteAttachment;
window.closeDeleteAttachmentModal = closeDeleteAttachmentModal;
window.confirmDeleteAttachment = confirmDeleteAttachment;
window.openRenameListModal = openRenameListModal;
window.closeRenameListModal = closeRenameListModal;
window.saveListRename = saveListRename;
window.confirmDeleteList = confirmDeleteList;
window.closeDeleteListModal = closeDeleteListModal;
window.closeDeleteConfirmationModal = closeDeleteConfirmationModal;
window.deleteList = deleteList;
// Countdown timer functionality
let countdownInterval = null;

function startCountdownTimers() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Update countdown every second
    countdownInterval = setInterval(() => {
        updateAllCountdowns();
    }, 1000);
    
    // Initial update
    updateAllCountdowns();
}

function updateAllCountdowns() {
    const countdownElements = document.querySelectorAll('.card-due-date:not(.completed)');
    
    countdownElements.forEach(element => {
        const dueDate = element.getAttribute('data-due-date');
        const cardId = element.getAttribute('data-card-id');
        
        if (dueDate) {
            // Check if card is completed
            const card = findCardById(parseInt(cardId));
            const isCompleted = card && (card.is_completed === 1 || card.is_completed === true);
            
            if (!isCompleted) {
                const displayText = formatDueDateDisplay(dueDate, false);
                const statusClass = getCountdownStatusClass(dueDate, false);
                
                // Update the countdown text
                const countdownSpan = element.querySelector('.countdown-text');
                if (countdownSpan) {
                    countdownSpan.textContent = displayText;
                }
                
                // Update the status class
                element.className = `card-due-date ${statusClass}`;
            }
        }
    });
}

function findCardById(cardId) {
    if (!currentBoard || !currentBoard.lists) return null;
    
    for (const list of currentBoard.lists) {
        if (list.cards) {
            const card = list.cards.find(c => c.id === cardId);
            if (card) return card;
        }
    }
    return null;
}

function stopCountdownTimers() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

window.editBoardTitle = editBoardTitle;
window.saveBoardTitle = saveBoardTitle;
window.cancelTitleEdit = cancelTitleEdit;
window.showBoardStatistics = showBoardStatistics;
window.closeBoardStatistics = closeBoardStatistics;

// Comments functionality
let mentionDropdownVisible = false;
let mentionStartIndex = -1;
let selectedMentionIndex = -1;

// Load comments for a card
function loadComments(cardId) {
    if (!window.db) return;
    
    const comments = window.db.findBy('comments', { card_id: cardId }) || [];
    const commentsList = document.getElementById('commentsList');
    
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    const commentsHTML = comments.map(comment => {
        const author = getBoardMemberById(comment.user_id) || { name: 'Unknown User', avatar: 'U', color: '#6c757d' };
        const timestamp = formatCommentTimestamp(comment.created_at);
        const processedText = processCommentMentions(comment.content);
        
        return `
            <div class="comment-item">
                <div class="comment-avatar" style="background: ${author.color};">
                    ${author.avatar}
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(author.name)}</span>
                        <span class="comment-timestamp">${timestamp}</span>
                    </div>
                    <div class="comment-text">${processedText}</div>
                </div>
            </div>
        `;
    }).join('');
    
    commentsList.innerHTML = commentsHTML;
}

// Add a new comment
function addComment() {
    const cardId = window.currentCardId;
    const commentInput = document.getElementById('commentInput');
    
    if (!cardId || !commentInput) return;
    
    const content = commentInput.value.trim();
    if (!content) {
        showNotification('Please enter a comment', 'error');
        return;
    }
    
    try {
        // Create comment object
        const comment = {
            card_id: cardId,
            user_id: 1, // Current user (Luc Trevecedo)
            content: content,
            created_at: new Date().toISOString()
        };
        
        // Save to database
        window.db.insert('comments', comment);
        
        // Clear input
        commentInput.value = '';
        
        // Reload comments
        loadComments(cardId);
        
        showNotification('Comment added successfully', 'success');
        
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment', 'error');
    }
}

// Cancel comment
function cancelComment() {
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.value = '';
    }
    hideMentionDropdown();
}

// Setup mention functionality
function setupMentionDropdown() {
    const commentInput = document.getElementById('commentInput');
    if (!commentInput) return;
    
    commentInput.addEventListener('input', handleMentionInput);
    commentInput.addEventListener('keydown', handleMentionKeydown);
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.composer-input-container')) {
            hideMentionDropdown();
        }
    });
}

// Handle mention input
function handleMentionInput(e) {
    const input = e.target;
    const value = input.value;
    const cursorPos = input.selectionStart;
    
    // Find @ symbol before cursor
    let atIndex = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
        if (value[i] === '@') {
            atIndex = i;
            break;
        }
        if (value[i] === ' ' || value[i] === '\n') {
            break;
        }
    }
    
    if (atIndex !== -1) {
        const searchText = value.substring(atIndex + 1, cursorPos).toLowerCase();
        mentionStartIndex = atIndex;
        showMentionDropdown(searchText);
    } else {
        hideMentionDropdown();
    }
}

// Handle mention keyboard navigation
function handleMentionKeydown(e) {
    if (!mentionDropdownVisible) return;
    
    const dropdown = document.getElementById('mentionDropdown');
    const options = dropdown.querySelectorAll('.mention-option');
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedMentionIndex = Math.min(selectedMentionIndex + 1, options.length - 1);
            updateMentionSelection(options);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedMentionIndex = Math.max(selectedMentionIndex - 1, 0);
            updateMentionSelection(options);
            break;
        case 'Enter':
        case 'Tab':
            e.preventDefault();
            if (selectedMentionIndex >= 0) {
                selectMention(options[selectedMentionIndex]);
            }
            break;
        case 'Escape':
            e.preventDefault();
            hideMentionDropdown();
            break;
        default:
            // Handle other keys
            break;
    }
}

// Show mention dropdown
function showMentionDropdown(searchText) {
    const dropdown = document.getElementById('mentionDropdown');
    if (!dropdown) return;
    
    // Get board members for mentions
    const boardMembers = [
        { id: 1, name: "Luc Trevecedo", avatar: "LT", color: "#0079bf" },
        { id: 2, name: "Paolo Rayos", avatar: "PR", color: "#61bd4f" },
        { id: 3, name: "Elijah Sintor", avatar: "ES", color: "#f2d600" },
        { id: 4, name: "Nathaniel Andrada", avatar: "NA", color: "#eb5a46" },
        { id: 5, name: "Andrew Llego", avatar: "AL", color: "#c377e0" }
    ];
    
    const filteredMembers = boardMembers.filter(member => 
        member.name.toLowerCase().includes(searchText)
    );
    
    if (filteredMembers.length === 0) {
        hideMentionDropdown();
        return;
    }
    
    const optionsHTML = filteredMembers.map((member, index) => `
        <div class="mention-option" data-user-id="${member.id}" data-name="${member.name}">
            <div class="mention-option-avatar" style="background: ${member.color};">
                ${member.avatar}
            </div>
            <div class="mention-option-name">${escapeHtml(member.name)}</div>
        </div>
    `).join('');
    
    dropdown.innerHTML = optionsHTML;
    dropdown.style.display = 'block';
    mentionDropdownVisible = true;
    selectedMentionIndex = 0;
    
    // Add click handlers
    dropdown.querySelectorAll('.mention-option').forEach((option, index) => {
        option.addEventListener('click', () => selectMention(option));
    });
    
    updateMentionSelection(dropdown.querySelectorAll('.mention-option'));
}

// Hide mention dropdown
function hideMentionDropdown() {
    const dropdown = document.getElementById('mentionDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    mentionDropdownVisible = false;
    selectedMentionIndex = -1;
    mentionStartIndex = -1;
}

// Update mention selection
function updateMentionSelection(options) {
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === selectedMentionIndex);
    });
}

// Select a mention
function selectMention(option) {
    const commentInput = document.getElementById('commentInput');
    const name = option.dataset.name;
    
    if (!commentInput || mentionStartIndex === -1) return;
    
    const value = commentInput.value;
    const beforeMention = value.substring(0, mentionStartIndex);
    const afterMention = value.substring(commentInput.selectionStart);
    
    const newValue = beforeMention + `@${name} ` + afterMention;
    commentInput.value = newValue;
    
    // Set cursor position
    const newCursorPos = beforeMention.length + name.length + 2;
    commentInput.setSelectionRange(newCursorPos, newCursorPos);
    
    hideMentionDropdown();
    commentInput.focus();
}

// Process comment mentions for display
function processCommentMentions(content) {
    const boardMembers = [
        { id: 1, name: "Luc Trevecedo", avatar: "LT", color: "#0079bf" },
        { id: 2, name: "Paolo Rayos", avatar: "PR", color: "#61bd4f" },
        { id: 3, name: "Elijah Sintor", avatar: "ES", color: "#f2d600" },
        { id: 4, name: "Nathaniel Andrada", avatar: "NA", color: "#eb5a46" },
        { id: 5, name: "Andrew Llego", avatar: "AL", color: "#c377e0" }
    ];
    
    let processedContent = escapeHtml(content);
    
    boardMembers.forEach(member => {
        const mentionRegex = new RegExp(`@${escapeRegex(member.name)}\\b`, 'gi');
        processedContent = processedContent.replace(mentionRegex, 
            `<span class="comment-mention">@${member.name}</span>`
        );
    });
    
    return processedContent;
}

// Helper functions
function getBoardMemberById(userId) {
    const boardMembers = [
        { id: 1, name: "Luc Trevecedo", avatar: "LT", color: "#0079bf" },
        { id: 2, name: "Paolo Rayos", avatar: "PR", color: "#61bd4f" },
        { id: 3, name: "Elijah Sintor", avatar: "ES", color: "#f2d600" },
        { id: 4, name: "Nathaniel Andrada", avatar: "NA", color: "#eb5a46" },
        { id: 5, name: "Andrew Llego", avatar: "AL", color: "#c377e0" }
    ];
    return boardMembers.find(member => member.id === userId);
}

function formatCommentTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return `${Math.floor(diffHours)} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialize comments when card modal opens
const originalOpenCardModal = window.openCardModal;
if (originalOpenCardModal) {
    window.openCardModal = async function(cardId) {
        await originalOpenCardModal(cardId);
        setTimeout(() => {
            loadComments(cardId);
            setupMentionDropdown();
        }, 100);
    };
}

window.startCountdownTimers = startCountdownTimers;

// Export comment functions globally
window.addComment = addComment;
window.cancelComment = cancelComment;

// Invite Modal Tab Functionality
function initializeInviteModalTabs() {
    const tabButtons = document.querySelectorAll('.invite-tab-btn');
    const tabPanels = document.querySelectorAll('.invite-tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab + 'Tab');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Handle form submission
    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('inviteEmail').value;
            // const permission = document.getElementById('permissionLevel').value; // Reserved for future use
            
            if (email) {
                // Show success message
                if (window.showNotification) {
                    window.showNotification(`Invitation sent to ${email}`, 'success');
                }
                
                // Close modal
                const modal = document.getElementById('inviteModal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                // Reset form
                this.reset();
            }
        });
    }
}

// Make function globally available
window.initializeInviteModalTabs = initializeInviteModalTabs;

// Function to handle invite form submission

// Initialize invite modal when DOM is loaded
// Removed auto-initialization - React components will call these functions manually
/*
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', originalInviteModalSetup);
} else {
    originalInviteModalSetup();
}
*/

// Global variables for modal functionality
let memberToRemove = null;
let requestToHandle = null;
let requestAction = null;

// Success Invitation Modal Functions
function showInvitationSuccessModal() {
    const modal = document.getElementById('invitationSuccessModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeInvitationSuccessModal() {
    const modal = document.getElementById('invitationSuccessModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Remove Member Modal Functions
function showRemoveMemberModal(memberName, memberElement) {
    memberToRemove = memberElement;
    const modal = document.getElementById('removeMemberModal');
    const nameSpan = document.getElementById('memberToRemoveName');
    
    if (modal && nameSpan) {
        nameSpan.textContent = memberName;
        modal.classList.add('active');
    }
}

function closeRemoveMemberModal() {
    const modal = document.getElementById('removeMemberModal');
    if (modal) {
        modal.classList.remove('active');
    }
    memberToRemove = null;
}

function confirmRemoveMember() {
    if (memberToRemove) {
        // Remove the member from the DOM
        memberToRemove.remove();
        
        // Update the member count
        updateMemberCount();
        
        // Show success notification
        showNotification('Member removed successfully', 'success');
    }
    closeRemoveMemberModal();
}

// Join Request Modal Functions
function showJoinRequestModal(userName, action, requestElement) {
    requestToHandle = requestElement;
    requestAction = action;
    
    const modal = document.getElementById('joinRequestModal');
    const title = document.getElementById('joinRequestTitle');
    const message = document.getElementById('joinRequestMessage');
    const userNameSpan = document.getElementById('requestUserName');
    const confirmBtn = document.getElementById('confirmJoinRequestBtn');
    
    if (modal && title && message && userNameSpan && confirmBtn) {
        userNameSpan.textContent = userName;
        
        if (action === 'accept') {
            title.textContent = 'Accept Join Request';
            message.innerHTML = `Are you sure you want to accept <span id="requestUserName">${userName}</span>'s request to join this board?`;
            confirmBtn.textContent = 'Accept';
            confirmBtn.className = 'btn btn-primary';
        } else {
            title.textContent = 'Decline Join Request';
            message.innerHTML = `Are you sure you want to decline <span id="requestUserName">${userName}</span>'s request to join this board?`;
            confirmBtn.textContent = 'Decline';
            confirmBtn.className = 'btn btn-danger';
        }
        
        modal.classList.add('active');
    }
}

function closeJoinRequestModal() {
    const modal = document.getElementById('joinRequestModal');
    if (modal) {
        modal.classList.remove('active');
    }
    requestToHandle = null;
    requestAction = null;
}

function closeRequestAcceptedModal() {
    const modal = document.getElementById('requestAcceptedModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function closeRequestDeclinedModal() {
    const modal = document.getElementById('requestDeclinedModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function closeMemberRemovedModal() {
    const modal = document.getElementById('memberRemovedModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function confirmJoinRequest() {
    if (requestToHandle && requestAction) {
        if (requestAction === 'accept') {
            // Move user to board members (in a real app, this would be an API call)
            const userName = requestToHandle.querySelector('.member-name').textContent;
            addMemberToBoardList(userName);
            showNotification('Join request accepted successfully', 'success');
        } else {
            showNotification('Join request declined', 'info');
        }
        
        // Remove the request from the list
        requestToHandle.remove();
        
        // Update request count
        updateRequestCount();
    }
    closeJoinRequestModal();
}

// Helper Functions
function updateMemberCount() {
    const membersList = document.getElementById('boardMembersList');
    const memberCount = membersList ? membersList.children.length : 0;
    const countElement = document.querySelector('.invite-tab-btn[data-tab="members"] .tab-count');
    if (countElement) {
        countElement.textContent = memberCount;
    }
}

function updateRequestCount() {
    const requestsList = document.getElementById('joinRequestsList');
    const requestCount = requestsList ? requestsList.children.length : 0;
    const countElement = document.querySelector('.invite-tab-btn[data-tab="requests"] .tab-count');
    if (countElement) {
        countElement.textContent = requestCount;
    }
}

function addMemberToBoardList(userName) {
    // This would normally be handled by the backend
    // For demo purposes, we'll just show a notification
    console.log(`Adding ${userName} to board members`);
}

// End of board.js file
// Initialize all modal functionality
// Removed auto-initialization - React components will call these functions manually
/*
document.addEventListener('DOMContentLoaded', function() {
    handleInviteFormSubmission();
    
    // Add event listeners to remove buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('member-remove-btn')) {
            const memberItem = e.target.closest('.member-item');
            const memberName = memberItem.querySelector('.member-name').textContent;
            showRemoveMemberModal(memberName, memberItem);
        }
        
        // Add event listeners to accept/decline buttons
        if (e.target.textContent === 'Accept' && e.target.closest('.request-item')) {
            const requestItem = e.target.closest('.request-item');
            const userName = requestItem.querySelector('.member-name').textContent;
            showJoinRequestModal(userName, 'accept', requestItem);
        }
        
        if (e.target.textContent === 'Decline' && e.target.closest('.request-item')) {
            const requestItem = e.target.closest('.request-item');
            const userName = requestItem.querySelector('.member-name').textContent;
            showJoinRequestModal(userName, 'decline', requestItem);
        }
    });
    
    // Add list modal event listeners
    const addListModal = document.getElementById('addListModal');
    if (addListModal) {
        addListModal.addEventListener('click', function(e) {
            if (e.target === addListModal) {
                closeAddListModal();
            }
        });
    }
});
*/

// Export functions globally
window.showInvitationSuccessModal = showInvitationSuccessModal;
window.closeInvitationSuccessModal = closeInvitationSuccessModal;
window.showRemoveMemberModal = showRemoveMemberModal;
window.closeRemoveMemberModal = closeRemoveMemberModal;
window.confirmRemoveMember = confirmRemoveMember;
window.closeRequestAcceptedModal = closeRequestAcceptedModal;
window.closeRequestDeclinedModal = closeRequestDeclinedModal;
window.closeMemberRemovedModal = closeMemberRemovedModal;
window.showJoinRequestModal = showJoinRequestModal;
window.closeJoinRequestModal = closeJoinRequestModal;
window.confirmJoinRequest = confirmJoinRequest;

// Add List Modal function
function showAddListModal() {
    const modal = document.getElementById('addListModal');
    const titleInput = document.getElementById('listTitle');
    
    if (modal) {
        modal.classList.add('active');
        // Focus on the input after modal opens
        setTimeout(() => {
            if (titleInput) {
                titleInput.focus();
            }
        }, 100);
    }
}

function closeAddListModal() {
    const modal = document.getElementById('addListModal');
    const form = document.getElementById('addListForm');
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Reset form
    if (form) {
        form.reset();
    }
}

function handleAddListSubmit(event) {
    event.preventDefault();
    
    const titleInput = document.getElementById('listTitle');
    const listName = titleInput.value.trim();
    
    if (listName) {
        addNewList(listName);
        closeAddListModal();
    }
}

// Add new list function
function addNewList(listName) {
    try {
        if (!window.db) {
            showNotification('Database not available', 'error');
            return;
        }

        // Create new list object
        const newList = {
            title: listName,
            board_id: parseInt(currentBoardId),
            position: Date.now(), // Simple position using timestamp
            created_at: new Date().toISOString()
        };

        // Save to database
        const result = window.db.insert('lists', newList);
        
        if (result) {
            showNotification('List added successfully', 'success');
            // Refresh the board to show the new list
            renderLists();
        } else {
            showNotification('Failed to add list', 'error');
        }
    } catch (error) {
        console.error('Error adding list:', error);
        showNotification('Failed to add list', 'error');
    }
}

// Export the new functions globally
window.showAddListModal = showAddListModal;
window.closeAddListModal = closeAddListModal;
window.handleAddListSubmit = handleAddListSubmit;
window.addNewList = addNewList;
window.stopCountdownTimers = stopCountdownTimers;
window.showAttachmentUpload = showAttachmentUpload;
window.downloadAttachment = downloadAttachment;
window.deleteAttachment = deleteAttachment;
window.closeDeleteCardModal = closeDeleteCardModal;
window.confirmDeleteCard = confirmDeleteCard;
window.closeDeleteChecklistItemModal = closeDeleteChecklistItemModal;
window.confirmDeleteChecklistItem = confirmDeleteChecklistItem;
window.openDeleteChecklistItemModal = openDeleteChecklistItemModal;

console.log("Board-modern.js loaded successfully");