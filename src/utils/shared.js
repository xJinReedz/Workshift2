// WorkShift - React Utility Functions
import { toast } from 'react-toastify';

// Modern Notification System using React Toastify
export const showToast = (message, type = 'info', duration = 4000) => {
  const options = { autoClose: duration };
  
  switch(type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    case 'warning':
      toast.warning(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

// Validation notification function
export const showValidationError = (message) => {
  showToast(message, 'error', 5000);
};

export const showSuccess = (message) => {
  showToast(message, 'success', 3000);
};

// Utility Functions
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const formatDateTime = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

export const getTimeUntilDeadline = (deadline) => {
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
};

export const generateAvatar = (name) => {
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  const colors = ['#0079bf', '#61bd4f', '#f2d600', '#eb5a46', '#00c2e0', '#c377e0', '#ff9f1a'];
  const color = colors[name.length % colors.length];
  
  return {
    initials: initials,
    color: color
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Animation helpers for React
export const fadeIn = (element, duration = 300) => {
  if (!element) return;
  
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
};

export const fadeOut = (element, duration = 300) => {
  if (!element) return;
  
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
};

// Mock API for authentication (replace with real implementation)
export const api = {
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },
  
  login: async (email, password, rememberMe = false) => {
    // Mock login implementation
    if (email && password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      return { success: true, user: { email, name: 'User' } };
    }
    return { success: false, error: 'Invalid credentials' };
  },
  
  logout: async () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    return { success: true };
  },
  
  register: async (userData) => {
    // Mock registration implementation
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', userData.email);
    return { success: true, user: userData };
  }
};

// Database mock for localStorage operations
export const database = {
  // Boards
  getBoards: () => {
    const boards = localStorage.getItem('workshift_boards');
    return boards ? JSON.parse(boards) : [];
  },
  
  saveBoard: (board) => {
    const boards = database.getBoards();
    const existingIndex = boards.findIndex(b => b.id === board.id);
    
    if (existingIndex !== -1) {
      boards[existingIndex] = board;
    } else {
      board.id = board.id || Date.now();
      boards.push(board);
    }
    
    localStorage.setItem('workshift_boards', JSON.stringify(boards));
    return board;
  },
  
  deleteBoard: (boardId) => {
    const boards = database.getBoards();
    const filteredBoards = boards.filter(b => b.id !== boardId);
    localStorage.setItem('workshift_boards', JSON.stringify(filteredBoards));
  },
  
  // Lists
  getLists: (boardId) => {
    const lists = localStorage.getItem(`workshift_lists_${boardId}`);
    return lists ? JSON.parse(lists) : [];
  },
  
  saveList: (boardId, list) => {
    const lists = database.getLists(boardId);
    const existingIndex = lists.findIndex(l => l.id === list.id);
    
    if (existingIndex !== -1) {
      lists[existingIndex] = list;
    } else {
      list.id = list.id || Date.now();
      lists.push(list);
    }
    
    localStorage.setItem(`workshift_lists_${boardId}`, JSON.stringify(lists));
    return list;
  },
  
  deleteList: (boardId, listId) => {
    const lists = database.getLists(boardId);
    const filteredLists = lists.filter(l => l.id !== listId);
    localStorage.setItem(`workshift_lists_${boardId}`, JSON.stringify(filteredLists));
  },
  
  // Cards
  getCards: (listId) => {
    const cards = localStorage.getItem(`workshift_cards_${listId}`);
    return cards ? JSON.parse(cards) : [];
  },
  
  saveCard: (listId, card) => {
    const cards = database.getCards(listId);
    const existingIndex = cards.findIndex(c => c.id === card.id);
    
    if (existingIndex !== -1) {
      cards[existingIndex] = card;
    } else {
      card.id = card.id || Date.now();
      cards.push(card);
    }
    
    localStorage.setItem(`workshift_cards_${listId}`, JSON.stringify(cards));
    return card;
  },
  
  deleteCard: (listId, cardId) => {
    const cards = database.getCards(listId);
    const filteredCards = cards.filter(c => c.id !== cardId);
    localStorage.setItem(`workshift_cards_${listId}`, JSON.stringify(filteredCards));
  }
};