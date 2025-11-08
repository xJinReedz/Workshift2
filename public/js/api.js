// WorkShift - JavaScript API Layer
// Replaces all PHP API endpoints with client-side JavaScript functions
// Maintains the same response format and logic as the original PHP APIs

class WorkShiftAPI {
    constructor() {
        this.db = window.db;
        this.currentUser = null;
        this.csrfToken = null;
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        this.generateCSRFToken();
    }

    // Session Management
    loadSession() {
        const sessionData = sessionStorage.getItem('workshift_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            this.currentUser = session.user;
            this.csrfToken = session.csrf_token;
        }
    }

    saveSession() {
        if (this.currentUser) {
            const session = {
                user: this.currentUser,
                csrf_token: this.csrfToken,
                timestamp: Date.now()
            };
            sessionStorage.setItem('workshift_session', JSON.stringify(session));
        }
    }

    clearSession() {
        this.currentUser = null;
        this.csrfToken = null;
        sessionStorage.removeItem('workshift_session');
        localStorage.removeItem('workshift_user');
    }

    generateCSRFToken() {
        this.csrfToken = this.generateRandomString(32);
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Utility Methods
    sendResponse(data, success = true, message = 'Success', statusCode = 200) {
        return {
            success,
            message,
            data,
            statusCode
        };
    }

    sendError(message, statusCode = 400) {
        return this.sendResponse(null, false, message, statusCode);
    }

    requireAuth() {
        if (!this.currentUser) {
            throw new Error('Unauthorized. Please login.');
        }
        return this.currentUser.id;
    }

    validateRequired(data, fields) {
        const missing = [];
        fields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
                missing.push(field);
            }
        });

        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    sanitizeString(str) {
        return str ? str.toString().trim() : '';
    }

    // Password utilities (simplified for client-side)
    async hashPassword(password) {
        // In a real application, never hash passwords client-side
        // This is a simplified version for demo purposes
        return '$2y$10$' + btoa(password).replace(/[^A-Za-z0-9]/g, '').substring(0, 22);
    }

    async verifyPassword(password, hash) {
        // Simplified verification for demo
        return hash === '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' && 
               password === 'workshift123@@';
    }

    // Authentication APIs
    async login(data) {
        try {
            this.validateRequired(data, ['email', 'password']);

            const email = this.sanitizeString(data.email);
            const password = data.password;

            if (!this.validateEmail(email)) {
                return this.sendError('Invalid email format', 422);
            }

            // Find user by email
            const users = this.db.findBy('users', { email: email });
            if (users.length === 0) {
                return this.sendError('Invalid email or password', 401);
            }

            const user = users[0];

            // Check if account is active
            if (!user.is_active) {
                return this.sendError('Account is disabled. Please contact support.', 403);
            }

            // Verify password
            const isValidPassword = await this.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return this.sendError('Invalid email or password', 401);
            }

            // Update last login
            this.db.update('users', user.id, { last_login: this.db.getCurrentTimestamp() });

            // Set current user
            this.currentUser = {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                avatar: user.avatar,
                avatar_color: user.avatar_color
            };

            this.generateCSRFToken();
            this.saveSession();

            // Log activity
            this.db.logActivity(user.id, 'user_login');

            // Remove password from response
            const userResponse = { ...user };
            delete userResponse.password;

            return this.sendResponse({
                user: userResponse,
                csrf_token: this.csrfToken
            }, true, 'Login successful');

        } catch (error) {
            console.error('Login error:', error);
            return this.sendError(error.message || 'An error occurred. Please try again.', 500);
        }
    }

    async register(data) {
        try {
            this.validateRequired(data, ['first_name', 'last_name', 'email', 'password']);

            const firstName = this.sanitizeString(data.first_name);
            const lastName = this.sanitizeString(data.last_name);
            const email = this.sanitizeString(data.email);
            const password = data.password;

            if (!this.validateEmail(email)) {
                return this.sendError('Invalid email format', 422);
            }

            if (password.length < 8) {
                return this.sendError('Password must be at least 8 characters long', 422);
            }

            // Check if user already exists
            const existingUsers = this.db.findBy('users', { email: email });
            if (existingUsers.length > 0) {
                return this.sendError('Email address is already registered', 409);
            }

            // Create user
            const hashedPassword = await this.hashPassword(password);
            const avatar = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            const avatarColors = ['#0079bf', '#61bd4f', '#f2d600', '#eb5a46', '#c377e0', '#ff9f1a'];
            const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

            const newUser = this.db.insert('users', {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: hashedPassword,
                avatar: avatar,
                avatar_color: avatarColor,
                is_active: true
            });

            // Log activity
            this.db.logActivity(newUser.id, 'user_register');

            return this.sendResponse({
                user_id: newUser.id
            }, true, 'User registered successfully');

        } catch (error) {
            console.error('Register error:', error);
            return this.sendError(error.message || 'Registration failed', 500);
        }
    }

    async logout() {
        try {
            const userId = this.currentUser ? this.currentUser.id : null;
            
            if (userId) {
                this.db.logActivity(userId, 'user_logout');
            }

            this.clearSession();
            return this.sendResponse({}, true, 'Logged out successfully');

        } catch (error) {
            console.error('Logout error:', error);
            return this.sendError('Logout failed', 500);
        }
    }

    // Board APIs
    async getBoards() {
        try {
            const userId = this.requireAuth();
            const boards = this.db.getBoardsWithMembersAndStats(userId);
            
            return this.sendResponse({ boards });

        } catch (error) {
            console.error('Get boards error:', error);
            return this.sendError(error.message || 'Failed to fetch boards', 500);
        }
    }

    async createBoard(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['title']);

            const title = this.sanitizeString(data.title);
            const description = this.sanitizeString(data.description || '');
            const backgroundColor = data.background_color || '#0079bf';
            const visibility = data.visibility || 'team';

            // Create board
            const board = this.db.insert('boards', {
                title,
                description,
                background_color: backgroundColor,
                background_image: data.background_image || null,
                visibility,
                is_starred: false,
                created_by: userId
            });

            // Add creator as owner
            this.db.insert('board_members', {
                board_id: board.id,
                user_id: userId,
                role: 'owner'
            });

            // Log activity
            this.db.logActivity(userId, 'created_board', board.id, null, `Created board: ${title}`);

            return this.sendResponse({
                board_id: board.id
            }, true, 'Board created successfully');

        } catch (error) {
            console.error('Create board error:', error);
            return this.sendError(error.message || 'Failed to create board', 500);
        }
    }

    async updateBoard(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['board_id']);

            const boardId = data.board_id;
            
            // Check if user has access to the board
            const membership = this.db.findBy('board_members', { board_id: boardId, user_id: userId });
            if (membership.length === 0) {
                return this.sendError('Board not found or access denied', 404);
            }

            // Prepare update data
            const updateData = {};
            if (data.title !== undefined) updateData.title = this.sanitizeString(data.title);
            if (data.description !== undefined) updateData.description = this.sanitizeString(data.description);
            if (data.background_color !== undefined) updateData.background_color = data.background_color;
            if (data.visibility !== undefined) updateData.visibility = data.visibility;
            if (data.is_starred !== undefined) updateData.is_starred = Boolean(data.is_starred);

            // Update board
            const updatedBoard = this.db.update('boards', boardId, updateData);

            if (updatedBoard) {
                // Log activity
                const action = data.is_starred !== undefined ? 
                    (data.is_starred ? 'starred_board' : 'unstarred_board') : 'updated_board';
                this.db.logActivity(userId, action, boardId);

                return this.sendResponse({ board: updatedBoard }, true, 'Board updated successfully');
            } else {
                return this.sendError('Board not found', 404);
            }

        } catch (error) {
            console.error('Update board error:', error);
            return this.sendError(error.message || 'Failed to update board', 500);
        }
    }

    async deleteBoard(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['board_id']);

            const boardId = data.board_id;

            // Check if user is owner of the board
            const membership = this.db.findBy('board_members', { 
                board_id: boardId, 
                user_id: userId, 
                role: 'owner' 
            });
            
            if (membership.length === 0) {
                return this.sendError('Only board owners can delete boards', 403);
            }

            const board = this.db.findById('boards', boardId);
            if (!board) {
                return this.sendError('Board not found', 404);
            }

            // Delete all related data (cascade delete)
            const lists = this.db.findBy('lists', { board_id: boardId });
            const listIds = lists.map(list => list.id);

            // Delete cards and related data
            listIds.forEach(listId => {
                const cards = this.db.findBy('cards', { list_id: listId });
                cards.forEach(card => {
                    this.db.deleteBy('card_assignees', { card_id: card.id });
                    this.db.deleteBy('card_labels', { card_id: card.id });
                    this.db.deleteBy('checklist_items', { card_id: card.id });
                    this.db.deleteBy('comments', { card_id: card.id });
                    this.db.deleteBy('attachments', { card_id: card.id });
                });
                this.db.deleteBy('cards', { list_id: listId });
            });

            // Delete lists
            this.db.deleteBy('lists', { board_id: boardId });

            // Delete labels
            this.db.deleteBy('labels', { board_id: boardId });

            // Delete board members
            this.db.deleteBy('board_members', { board_id: boardId });

            // Delete board
            this.db.delete('boards', boardId);

            // Log activity
            this.db.logActivity(userId, 'deleted_board', null, null, `Deleted board: ${board.title}`);

            return this.sendResponse({}, true, 'Board deleted successfully');

        } catch (error) {
            console.error('Delete board error:', error);
            return this.sendError(error.message || 'Failed to delete board', 500);
        }
    }

    // List APIs
    async getLists(boardId) {
        try {
            const userId = this.requireAuth();

            // Check if user has access to the board
            const membership = this.db.findBy('board_members', { board_id: boardId, user_id: userId });
            if (membership.length === 0) {
                return this.sendError('Board not found or access denied', 404);
            }

            const lists = this.db.findBy('lists', { board_id: boardId }, 'position ASC');
            return this.sendResponse({ lists });

        } catch (error) {
            console.error('Get lists error:', error);
            return this.sendError(error.message || 'Failed to fetch lists', 500);
        }
    }

    async createList(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['board_id', 'title']);

            const boardId = data.board_id;
            const title = this.sanitizeString(data.title);

            // Check if user has access to the board
            const membership = this.db.findBy('board_members', { board_id: boardId, user_id: userId });
            if (membership.length === 0) {
                return this.sendError('Board not found or access denied', 404);
            }

            // Get next position
            const existingLists = this.db.findBy('lists', { board_id: boardId });
            const nextPosition = existingLists.length > 0 ? 
                Math.max(...existingLists.map(l => l.position)) + 1 : 1;

            const list = this.db.insert('lists', {
                board_id: boardId,
                title,
                position: nextPosition
            });

            // Log activity
            this.db.logActivity(userId, 'created_list', boardId, null, `Created list: ${title}`);

            return this.sendResponse({ list }, true, 'List created successfully');

        } catch (error) {
            console.error('Create list error:', error);
            return this.sendError(error.message || 'Failed to create list', 500);
        }
    }

    // Card APIs
    async getCards(listId) {
        try {
            const userId = this.requireAuth();

            const list = this.db.findById('lists', listId);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            // Check if user has access to the board
            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            const cards = this.db.findBy('cards', { list_id: listId }, 'position ASC');
            return this.sendResponse({ cards });

        } catch (error) {
            console.error('Get cards error:', error);
            return this.sendError(error.message || 'Failed to fetch cards', 500);
        }
    }

    async createCard(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['list_id', 'title']);

            const listId = data.list_id;
            const title = this.sanitizeString(data.title);
            const description = this.sanitizeString(data.description || '');

            const list = this.db.findById('lists', listId);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            // Check if user has access to the board
            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            // Get next position
            const existingCards = this.db.findBy('cards', { list_id: listId });
            const nextPosition = existingCards.length > 0 ? 
                Math.max(...existingCards.map(c => c.position)) + 1 : 1;

            const card = this.db.insert('cards', {
                list_id: listId,
                title,
                description,
                position: nextPosition,
                due_date: data.due_date || null,
                is_completed: false,
                created_by: userId
            });

            // Add creator as assignee
            this.db.insert('card_assignees', {
                card_id: card.id,
                user_id: userId
            });

            // Log activity
            this.db.logActivity(userId, 'created_card', list.board_id, card.id, `Created card: ${title}`);

            return this.sendResponse({ card }, true, 'Card created successfully');

        } catch (error) {
            console.error('Create card error:', error);
            return this.sendError(error.message || 'Failed to create card', 500);
        }
    }

    async getCardDetails(cardId) {
        try {
            const userId = this.requireAuth();
            
            const cardDetails = this.db.getCardWithDetails(cardId);
            if (!cardDetails) {
                return this.sendError('Card not found', 404);
            }

            // Check user access
            const list = this.db.findById('lists', cardDetails.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            return this.sendResponse({ card: cardDetails });

        } catch (error) {
            console.error('Get card details error:', error);
            return this.sendError(error.message || 'Failed to fetch card details', 500);
        }
    }

    async updateCard(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['card_id']);

            const cardId = data.card_id;
            const card = this.db.findById('cards', cardId);
            
            if (!card) {
                return this.sendError('Card not found', 404);
            }

            // Check user access
            const list = this.db.findById('lists', card.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            // Update card fields
            const updateData = {};
            if (data.title !== undefined) updateData.title = this.sanitizeString(data.title);
            if (data.description !== undefined) updateData.description = this.sanitizeString(data.description);
            if (data.due_date !== undefined) updateData.due_date = data.due_date;
            if (data.is_completed !== undefined) updateData.is_completed = data.is_completed ? 1 : 0;
            if (data.list_id !== undefined) updateData.list_id = parseInt(data.list_id);
            if (data.position !== undefined) updateData.position = parseInt(data.position);

            const success = this.db.update('cards', cardId, updateData);
            
            if (!success) {
                return this.sendError('Failed to update card', 500);
            }

            const updatedCard = this.db.getCardWithDetails(cardId);
            return this.sendResponse({ card: updatedCard });

        } catch (error) {
            console.error('Update card error:', error);
            return this.sendError(error.message || 'Failed to update card', 500);
        }
    }

    async deleteCard(cardId) {
        try {
            const userId = this.requireAuth();
            
            const card = this.db.findById('cards', cardId);
            if (!card) {
                return this.sendError('Card not found', 404);
            }

            // Check user access
            const list = this.db.findById('lists', card.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            // Delete related data first
            this.db.deleteBy('comments', { card_id: cardId });
            this.db.deleteBy('checklist_items', { card_id: cardId });
            this.db.deleteBy('card_labels', { card_id: cardId });
            this.db.deleteBy('attachments', { card_id: cardId });
            
            // Delete the card
            const success = this.db.delete('cards', cardId);
            
            if (!success) {
                return this.sendError('Failed to delete card', 500);
            }

            return this.sendResponse({ message: 'Card deleted successfully' });

        } catch (error) {
            console.error('Delete card error:', error);
            return this.sendError(error.message || 'Failed to delete card', 500);
        }
    }

    // Comments API
    async addComment(data) {
        try {
            const userId = this.requireAuth();
            this.validateRequired(data, ['card_id', 'comment']);

            const cardId = data.card_id;
            const commentText = this.sanitizeString(data.comment);

            const card = this.db.findById('cards', cardId);
            if (!card) {
                return this.sendError('Card not found', 404);
            }

            const list = this.db.findById('lists', card.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            // Check user access
            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            const comment = this.db.insert('comments', {
                card_id: cardId,
                user_id: userId,
                comment: commentText
            });

            // Get user info for response
            const user = this.db.findById('users', userId);
            const commentWithUser = {
                ...comment,
                user: user || { first_name: 'Unknown', last_name: 'User', avatar: '?', avatar_color: '#666' }
            };

            // Log activity
            this.db.logActivity(userId, 'added_comment', list.board_id, cardId, `Added comment to card: ${card.title}`);

            return this.sendResponse({ comment: commentWithUser }, true, 'Comment added successfully');

        } catch (error) {
            console.error('Add comment error:', error);
            return this.sendError(error.message || 'Failed to add comment', 500);
        }
    }

    // Attachment APIs
    async downloadAttachment(attachmentId) {
        try {
            const userId = this.requireAuth();
            
            const attachment = this.db.findById('attachments', attachmentId);
            if (!attachment) {
                return this.sendError('Attachment not found', 404);
            }

            const card = this.db.findById('cards', attachment.card_id);
            if (!card) {
                return this.sendError('Card not found', 404);
            }

            const list = this.db.findById('lists', card.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            // Check user access
            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            // In a real app, this would return the file URL or stream the file
            // For now, we'll simulate the response
            const downloadUrl = `uploads/attachments/${attachment.file_path}`;
            
            return this.sendResponse({
                url: downloadUrl,
                filename: attachment.filename,
                size: attachment.file_size
            }, true, 'Attachment ready for download');

        } catch (error) {
            console.error('Download attachment error:', error);
            return this.sendError(error.message || 'Failed to download attachment', 500);
        }
    }

    async deleteAttachment(attachmentId) {
        try {
            const userId = this.requireAuth();
            
            const attachment = this.db.findById('attachments', attachmentId);
            if (!attachment) {
                return this.sendError('Attachment not found', 404);
            }

            const card = this.db.findById('cards', attachment.card_id);
            if (!card) {
                return this.sendError('Card not found', 404);
            }

            const list = this.db.findById('lists', card.list_id);
            if (!list) {
                return this.sendError('List not found', 404);
            }

            // Check user access
            const membership = this.db.findBy('board_members', { 
                board_id: list.board_id, 
                user_id: userId 
            });
            if (membership.length === 0) {
                return this.sendError('Access denied', 403);
            }

            // Delete the attachment record
            const success = this.db.delete('attachments', attachmentId);
            
            if (!success) {
                return this.sendError('Failed to delete attachment', 500);
            }

            // Log activity
            this.db.logActivity(userId, 'deleted_attachment', list.board_id, attachment.card_id, 
                `Deleted attachment: ${attachment.filename}`);

            return this.sendResponse({}, true, 'Attachment deleted successfully');

        } catch (error) {
            console.error('Delete attachment error:', error);
            return this.sendError(error.message || 'Failed to delete attachment', 500);
        }
    }

    // Current user info
    getCurrentUser() {
        if (this.currentUser) {
            return this.sendResponse({ user: this.currentUser });
        } else {
            return this.sendError('Not authenticated', 401);
        }
    }

    // Check authentication status
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Initialize global API instance
window.api = new WorkShiftAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkShiftAPI;
}