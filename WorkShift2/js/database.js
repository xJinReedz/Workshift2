// WorkShift - Client-Side Database using localStorage with IndexedDB-like structure
// This replaces the MySQL database while maintaining all relationships and data integrity

class WorkShiftDB {
    constructor() {
        this.dbName = 'workshift_db';
        this.version = 1;
        this.tables = [
            'users', 'boards', 'board_members', 'lists', 'cards', 
            'labels', 'card_labels', 'checklist_items', 'attachments',
            'card_assignees', 'comments', 'calendar_events', 
            'notifications', 'activity_log'
        ];
        this.init();
    }

    init() {
        // Initialize database structure if not exists
        if (!localStorage.getItem(`${this.dbName}_initialized`)) {
            this.createDatabase();
            this.seedDatabase();
            localStorage.setItem(`${this.dbName}_initialized`, 'true');
        }
    }

    createDatabase() {
        // Create empty tables structure
        this.tables.forEach(table => {
            if (!localStorage.getItem(`${this.dbName}_${table}`)) {
                localStorage.setItem(`${this.dbName}_${table}`, JSON.stringify([]));
            }
        });

        // Create sequences for auto-increment IDs
        this.tables.forEach(table => {
            if (!localStorage.getItem(`${this.dbName}_${table}_sequence`)) {
                localStorage.setItem(`${this.dbName}_${table}_sequence`, '1');
            }
        });
    }

    seedDatabase() {
        // Insert sample data
        this.insertSampleUsers();
        this.insertSampleBoards();
        this.insertSampleLists();
        this.insertSampleCards();
        this.insertSampleLabels();
    }

    // Utility Methods
    getTable(tableName) {
        const data = localStorage.getItem(`${this.dbName}_${tableName}`);
        return data ? JSON.parse(data) : [];
    }

    saveTable(tableName, data) {
        localStorage.setItem(`${this.dbName}_${tableName}`, JSON.stringify(data));
    }

    getNextId(tableName) {
        const sequence = localStorage.getItem(`${this.dbName}_${tableName}_sequence`);
        const nextId = sequence ? parseInt(sequence) : 1;
        localStorage.setItem(`${this.dbName}_${tableName}_sequence`, (nextId + 1).toString());
        return nextId;
    }

    getCurrentTimestamp() {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // Generic CRUD Operations
    insert(tableName, data) {
        const table = this.getTable(tableName);
        const newRecord = {
            id: this.getNextId(tableName),
            ...data,
            created_at: this.getCurrentTimestamp(),
            updated_at: this.getCurrentTimestamp()
        };
        table.push(newRecord);
        this.saveTable(tableName, table);
        return newRecord;
    }

    findById(tableName, id) {
        const table = this.getTable(tableName);
        return table.find(record => record.id == id);
    }

    findBy(tableName, conditions) {
        const table = this.getTable(tableName);
        return table.filter(record => {
            return Object.keys(conditions).every(key => {
                if (conditions[key] === null) {
                    return record[key] === null || record[key] === undefined;
                }
                return record[key] == conditions[key];
            });
        });
    }

    findAll(tableName, orderBy = null) {
        let table = this.getTable(tableName);
        
        if (orderBy) {
            const [field, direction = 'ASC'] = orderBy.split(' ');
            table.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                
                if (direction.toUpperCase() === 'DESC') {
                    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                }
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            });
        }
        
        return table;
    }

    update(tableName, id, data) {
        const table = this.getTable(tableName);
        const index = table.findIndex(record => record.id == id);
        
        if (index !== -1) {
            table[index] = {
                ...table[index],
                ...data,
                updated_at: this.getCurrentTimestamp()
            };
            this.saveTable(tableName, table);
            return table[index];
        }
        return null;
    }

    delete(tableName, id) {
        const table = this.getTable(tableName);
        const index = table.findIndex(record => record.id == id);
        
        if (index !== -1) {
            const deleted = table.splice(index, 1)[0];
            this.saveTable(tableName, table);
            return deleted;
        }
        return null;
    }

    deleteBy(tableName, conditions) {
        const table = this.getTable(tableName);
        const toDelete = [];
        
        for (let i = table.length - 1; i >= 0; i--) {
            const record = table[i];
            const matches = Object.keys(conditions).every(key => 
                record[key] == conditions[key]
            );
            
            if (matches) {
                toDelete.push(table.splice(i, 1)[0]);
            }
        }
        
        if (toDelete.length > 0) {
            this.saveTable(tableName, table);
        }
        
        return toDelete;
    }

    // Sample Data Insertion Methods
    insertSampleUsers() {
        const users = [
            {
                first_name: 'Luc',
                last_name: 'Trevecedo',
                email: 'john@gmail.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // workshift123@@
                avatar: 'LT',
                avatar_color: '#0079bf',
                last_login: null,
                is_active: true
            },
            {
                first_name: 'Paolo',
                last_name: 'Rayos',
                email: 'paolo@gmail.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                avatar: 'PR',
                avatar_color: '#61bd4f',
                last_login: null,
                is_active: true
            },
            {
                first_name: 'Elijah',
                last_name: 'Sintor',
                email: 'elijah@gmail.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                avatar: 'ES',
                avatar_color: '#f2d600',
                last_login: null,
                is_active: true
            },
            {
                first_name: 'Nathaniel',
                last_name: 'Andrada',
                email: 'nathaniel@gmail.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                avatar: 'NA',
                avatar_color: '#eb5a46',
                last_login: null,
                is_active: true
            },
            {
                first_name: 'Andrew',
                last_name: 'Llego',
                email: 'andrew@gmail.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                avatar: 'AL',
                avatar_color: '#c377e0',
                last_login: null,
                is_active: true
            }
        ];

        users.forEach(user => this.insert('users', user));
    }

    insertSampleBoards() {
        const board = this.insert('boards', {
            title: 'Website Redesign',
            description: 'Complete overhaul of the company website with modern design and improved UX',
            background_color: '#0079bf',
            background_image: null,
            visibility: 'team',
            is_starred: true,
            created_by: 1
        });

        // Add board members
        const members = [
            { board_id: board.id, user_id: 1, role: 'owner' },
            { board_id: board.id, user_id: 2, role: 'admin' },
            { board_id: board.id, user_id: 3, role: 'member' },
            { board_id: board.id, user_id: 4, role: 'member' },
            { board_id: board.id, user_id: 5, role: 'member' }
        ];

        members.forEach(member => this.insert('board_members', member));
    }

    insertSampleLists() {
        const lists = [
            { board_id: 1, title: 'To Do', position: 1 },
            { board_id: 1, title: 'In Progress', position: 2 },
            { board_id: 1, title: 'Review', position: 3 },
            { board_id: 1, title: 'Done', position: 4 }
        ];

        lists.forEach(list => this.insert('lists', list));
    }

    insertSampleCards() {
        const cards = [
            {
                list_id: 1,
                title: 'Create wireframes for homepage',
                description: 'Design low-fidelity wireframes for the new homepage layout including header, hero section, and main content areas.',
                position: 1,
                due_date: '2025-10-26 23:59:00',
                is_completed: false,
                created_by: 1
            },
            {
                list_id: 1,
                title: 'Competitor analysis',
                description: 'Research competitor websites and analyze their design patterns, user flows, and features.',
                position: 2,
                due_date: '2025-10-30 23:59:00',
                is_completed: false,
                created_by: 3
            }
        ];

        cards.forEach(card => {
            const newCard = this.insert('cards', card);
            // Add card assignees
            if (newCard.created_by) {
                this.insert('card_assignees', {
                    card_id: newCard.id,
                    user_id: newCard.created_by
                });
            }
        });
    }

    insertSampleLabels() {
        const labels = [
            { board_id: 1, name: 'High Priority', color: '#eb5a46' },
            { board_id: 1, name: 'Design', color: '#c377e0' },
            { board_id: 1, name: 'Development', color: '#0079bf' },
            { board_id: 1, name: 'Review', color: '#ff9f1a' }
        ];

        labels.forEach(label => this.insert('labels', label));
    }

    // Complex Query Methods (similar to SQL JOINs)
    getBoardsWithMembersAndStats(userId) {
        const boards = this.findBy('board_members', { user_id: userId })
            .map(membership => {
                const board = this.findById('boards', membership.board_id);
                if (!board) return null;

                // Get board members
                const boardMembers = this.findBy('board_members', { board_id: board.id });
                const members = boardMembers.map(bm => {
                    const user = this.findById('users', bm.user_id);
                    return user ? { ...user, role: bm.role } : null;
                }).filter(Boolean);

                // Get lists and cards count
                const lists = this.findBy('lists', { board_id: board.id });
                const listIds = lists.map(list => list.id);
                let cardCount = 0;
                listIds.forEach(listId => {
                    cardCount += this.findBy('cards', { list_id: listId }).length;
                });

                // Get creator info
                const creator = this.findById('users', board.created_by);

                return {
                    ...board,
                    members,
                    list_count: lists.length,
                    card_count: cardCount,
                    created_by_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown'
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Sort by starred first, then by updated_at
                if (a.is_starred && !b.is_starred) return -1;
                if (!a.is_starred && b.is_starred) return 1;
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

        return boards;
    }

    getBoardWithLists(boardId, userId) {
        // Check if user has access to the board
        const membership = this.findBy('board_members', { board_id: boardId, user_id: userId });
        if (membership.length === 0) return null;

        const board = this.findById('boards', boardId);
        if (!board) return null;

        const lists = this.findBy('lists', { board_id: boardId })
            .sort((a, b) => a.position - b.position);

        const creator = this.findById('users', board.created_by);

        return {
            ...board,
            lists,
            created_by_name: creator ? `${creator.first_name} ${creator.last_name}` : 'Unknown'
        };
    }

    getCardsForBoard(boardId) {
        const lists = this.findBy('lists', { board_id: boardId });
        const listIds = lists.map(list => list.id);
        
        const allCards = [];
        listIds.forEach(listId => {
            const cards = this.findBy('cards', { list_id: listId })
                .sort((a, b) => a.position - b.position);
            allCards.push(...cards);
        });

        return allCards;
    }

    getCardWithDetails(cardId) {
        const card = this.findById('cards', cardId);
        if (!card) return null;

        // Get assignees
        const assigneeIds = this.findBy('card_assignees', { card_id: cardId })
            .map(ca => ca.user_id);
        const assignees = assigneeIds.map(id => this.findById('users', id)).filter(Boolean);

        // Get labels
        const labelIds = this.findBy('card_labels', { card_id: cardId })
            .map(cl => cl.label_id);
        const labels = labelIds.map(id => this.findById('labels', id)).filter(Boolean);

        // Get checklist items
        const checklistItems = this.findBy('checklist_items', { card_id: cardId })
            .sort((a, b) => a.position - b.position);

        // Get comments
        const comments = this.findBy('comments', { card_id: cardId })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Get comments with user info
        const commentsWithUsers = comments.map(comment => {
            const user = this.findById('users', comment.user_id);
            return {
                ...comment,
                user: user || { first_name: 'Unknown', last_name: 'User', avatar: '?', avatar_color: '#666' }
            };
        });

        // Get attachments
        const attachments = this.findBy('attachments', { card_id: cardId });

        return {
            ...card,
            assignees,
            labels,
            checklist_items: checklistItems,
            comments: commentsWithUsers,
            attachments
        };
    }

    // Activity logging
    logActivity(userId, action, boardId = null, cardId = null, details = null) {
        this.insert('activity_log', {
            user_id: userId,
            board_id: boardId,
            card_id: cardId,
            action,
            details
        });
    }

    // Clear all data (for testing)
    clearDatabase() {
        this.tables.forEach(table => {
            localStorage.removeItem(`${this.dbName}_${table}`);
            localStorage.removeItem(`${this.dbName}_${table}_sequence`);
        });
        localStorage.removeItem(`${this.dbName}_initialized`);
    }

    // Export/Import data
    exportData() {
        const data = {};
        this.tables.forEach(table => {
            data[table] = this.getTable(table);
        });
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.tables.forEach(table => {
                if (data[table]) {
                    this.saveTable(table, data[table]);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// Initialize global database instance
window.db = new WorkShiftDB();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkShiftDB;
}