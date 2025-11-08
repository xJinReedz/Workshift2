// Calendar specific JavaScript

let currentDate = new Date(2025, 9, 27); // October 27, 2025 (month is 0-indexed)
let currentView = 'monthly';

// Fallback functions for missing global functions
function showNotification(message, type) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Fallback to alert if no notification system is available
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function addHourToTime(timeStr) {
    // Simple time helper function
    const [hours, minutes] = timeStr.split(':');
    const newHours = (parseInt(hours) + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes}`;
}

// Google Calendar API configuration (for future use)
// const GOOGLE_CONFIG = {
//     apiKey: 'YOUR_GOOGLE_API_KEY', // Replace with your actual API key
//     clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
//     discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
//     scopes: 'https://www.googleapis.com/auth/calendar'
// };

// let isGoogleApiLoaded = false; // Reserved for future use
let isGoogleSignedIn = false;
let googleCalendarList = [];
let autoSyncEnabled = false;

// Sample events data - Task Due Dates for October & November 2025
const sampleEvents = [
    // October 2025 Events
    {
        id: 1,
        title: 'Website Wireframes Due',
        description: 'Complete wireframes for homepage redesign',
        date: '2025-10-01',
        time: '09:00',
        board: 'website-redesign'
    },
    {
        id: 2,
        title: 'Mobile App Beta Testing',
        description: 'Begin beta testing for mobile application',
        date: '2025-10-02',
        time: '10:00',
        board: 'mobile-app'
    },
    {
        id: 3,
        title: 'Marketing Campaign Assets',
        description: 'Deliver all marketing materials for Q4 campaign',
        date: '2025-10-03',
        time: '14:00',
        board: 'marketing'
    },
    {
        id: 4,
        title: 'Database Migration',
        description: 'Complete database migration to new server',
        date: '2025-10-04',
        time: '15:00',
        board: 'product-roadmap'
    },
    {
        id: 5,
        title: 'API Documentation',
        description: 'Finalize API documentation for developers',
        date: '2025-10-07',
        time: '11:00',
        board: 'mobile-app'
    },
    {
        id: 45,
        title: 'Daily Team Standup',
        description: 'Daily standup meeting with the development team',
        date: '2025-10-27',
        time: '09:00',
        board: 'product-roadmap'
    },
    {
        id: 46,
        title: 'Calendar Review Meeting',
        description: 'Review calendar functionality and user feedback',
        date: '2025-10-27',
        time: '14:00',
        board: 'website-redesign'
    },
    {
        id: 47,
        title: 'Project Demo Preparation',
        description: 'Prepare demo materials for tomorrow presentation',
        date: '2025-10-27',
        time: '17:00',
        board: 'website-redesign'
    },
    {
        id: 6,
        title: 'UI Component Library',
        description: 'Complete reusable UI component library',
        date: '2025-10-08',
        time: '16:00',
        board: 'website-redesign'
    },
    {
        id: 7,
        title: 'Security Audit Report',
        description: 'Submit comprehensive security audit findings',
        date: '2025-10-09',
        time: '09:30',
        board: 'product-roadmap'
    },
    {
        id: 8,
        title: 'User Research Summary',
        description: 'Compile user research findings and recommendations',
        date: '2025-10-10',
        time: '13:00',
        board: 'website-redesign'
    },
    {
        id: 9,
        title: 'Performance Optimization',
        description: 'Complete website performance optimization tasks',
        date: '2025-10-11',
        time: '10:30',
        board: 'website-redesign'
    },
    {
        id: 10,
        title: 'Social Media Content',
        description: 'Prepare social media content for product launch',
        date: '2025-10-14',
        time: '14:30',
        board: 'marketing'
    },
    {
        id: 11,
        title: 'Backend API Development',
        description: 'Complete REST API endpoints for mobile app',
        date: '2025-10-15',
        time: '12:00',
        board: 'mobile-app'
    },
    {
        id: 12,
        title: 'Content Management System',
        description: 'Deploy new CMS for content team',
        date: '2025-10-16',
        time: '09:00',
        board: 'website-redesign'
    },
    {
        id: 13,
        title: 'Customer Feedback Analysis',
        description: 'Analyze customer feedback and create action plan',
        date: '2025-10-17',
        time: '15:30',
        board: 'product-roadmap'
    },
    {
        id: 14,
        title: 'Email Campaign Setup',
        description: 'Configure automated email marketing campaign',
        date: '2025-10-18',
        time: '11:30',
        board: 'marketing'
    },
    {
        id: 15,
        title: 'Mobile App Store Submission',
        description: 'Submit mobile app to app stores for review',
        date: '2025-10-21',
        time: '16:00',
        board: 'mobile-app'
    },
    {
        id: 16,
        title: 'Website Accessibility Audit',
        description: 'Complete accessibility compliance review',
        date: '2025-10-22',
        time: '10:00',
        board: 'website-redesign'
    },
    {
        id: 17,
        title: 'Product Roadmap Review',
        description: 'Review and update product roadmap for 2026',
        date: '2025-10-23',
        time: '14:00',
        board: 'product-roadmap'
    },
    {
        id: 18,
        title: 'Brand Guidelines Update',
        description: 'Update brand guidelines with new visual elements',
        date: '2025-10-24',
        time: '13:30',
        board: 'marketing'
    },
    {
        id: 19,
        title: 'Payment Integration Testing',
        description: 'Complete payment gateway integration testing',
        date: '2025-10-25',
        time: '09:15',
        board: 'website-redesign'
    },
    {
        id: 20,
        title: 'Mobile App Beta Launch',
        description: 'Launch beta version of mobile app to test users',
        date: '2025-10-28',
        time: '12:30',
        board: 'mobile-app'
    },
    {
        id: 21,
        title: 'Analytics Dashboard',
        description: 'Deploy new analytics dashboard for stakeholders',
        date: '2025-10-29',
        time: '15:00',
        board: 'product-roadmap'
    },
    {
        id: 22,
        title: 'Content Calendar Q4',
        description: 'Finalize content calendar for Q4 marketing',
        date: '2025-10-30',
        time: '11:00',
        board: 'marketing'
    },
    {
        id: 23,
        title: 'Website Launch Preparation',
        description: 'Final preparations for website redesign launch',
        date: '2025-10-31',
        time: '17:00',
        board: 'website-redesign'
    },

    // November 2025 Events
    {
        id: 24,
        title: 'Website Redesign Launch',
        description: 'Official launch of redesigned website',
        date: '2025-11-01',
        time: '08:00',
        board: 'website-redesign'
    },
    {
        id: 25,
        title: 'Customer Support Training',
        description: 'Train support team on new features and processes',
        date: '2025-11-04',
        time: '10:00',
        board: 'product-roadmap'
    },
    {
        id: 26,
        title: 'Mobile App Store Approval',
        description: 'Follow up on app store approval status',
        date: '2025-11-05',
        time: '14:00',
        board: 'mobile-app'
    },
    {
        id: 27,
        title: 'Black Friday Campaign',
        description: 'Launch Black Friday marketing campaign',
        date: '2025-11-06',
        time: '09:00',
        board: 'marketing'
    },
    {
        id: 28,
        title: 'User Onboarding Flow',
        description: 'Implement improved user onboarding experience',
        date: '2025-11-07',
        time: '13:00',
        board: 'website-redesign'
    },
    {
        id: 29,
        title: 'Data Backup Verification',
        description: 'Verify all data backup systems are functioning',
        date: '2025-11-08',
        time: '16:30',
        board: 'product-roadmap'
    },
    {
        id: 30,
        title: 'Push Notification System',
        description: 'Deploy push notification system for mobile app',
        date: '2025-11-11',
        time: '11:30',
        board: 'mobile-app'
    },
    {
        id: 31,
        title: 'SEO Optimization Report',
        description: 'Complete SEO audit and optimization recommendations',
        date: '2025-11-12',
        time: '15:30',
        board: 'marketing'
    },
    {
        id: 32,
        title: 'Load Testing Results',
        description: 'Complete load testing and performance analysis',
        date: '2025-11-13',
        time: '10:15',
        board: 'website-redesign'
    },
    {
        id: 33,
        title: 'Feature Rollout Plan',
        description: 'Create plan for rolling out new features in 2026',
        date: '2025-11-14',
        time: '14:30',
        board: 'product-roadmap'
    },
    {
        id: 34,
        title: 'Mobile App Public Launch',
        description: 'Public launch of mobile application',
        date: '2025-11-15',
        time: '12:00',
        board: 'mobile-app'
    },
    {
        id: 35,
        title: 'Cyber Monday Preparation',
        description: 'Prepare systems and campaigns for Cyber Monday',
        date: '2025-11-18',
        time: '09:30',
        board: 'marketing'
    },
    {
        id: 36,
        title: 'User Feedback Integration',
        description: 'Integrate user feedback into product improvements',
        date: '2025-11-19',
        time: '16:00',
        board: 'website-redesign'
    },
    {
        id: 37,
        title: 'Security Patch Deployment',
        description: 'Deploy critical security patches across all systems',
        date: '2025-11-20',
        time: '08:30',
        board: 'product-roadmap'
    },
    {
        id: 38,
        title: 'App Store Optimization',
        description: 'Optimize app store listings for better visibility',
        date: '2025-11-21',
        time: '13:45',
        board: 'mobile-app'
    },
    {
        id: 39,
        title: 'Holiday Marketing Assets',
        description: 'Create holiday-themed marketing materials',
        date: '2025-11-22',
        time: '11:15',
        board: 'marketing'
    },
    {
        id: 40,
        title: 'Year-End Performance Review',
        description: 'Compile performance metrics and analysis for 2025',
        date: '2025-11-25',
        time: '15:00',
        board: 'product-roadmap'
    },
    {
        id: 41,
        title: 'Database Optimization',
        description: 'Optimize database queries and performance',
        date: '2025-11-26',
        time: '10:30',
        board: 'website-redesign'
    },
    {
        id: 42,
        title: 'Mobile App Analytics Setup',
        description: 'Configure comprehensive analytics for mobile app',
        date: '2025-11-27',
        time: '14:15',
        board: 'mobile-app'
    },
    {
        id: 43,
        title: 'Holiday Campaign Wrap-up',
        description: 'Analyze holiday marketing campaign performance',
        date: '2025-11-28',
        time: '12:45',
        board: 'marketing'
    },
    {
        id: 44,
        title: '2026 Planning Meeting',
        description: 'Strategic planning meeting for 2026 objectives',
        date: '2025-11-29',
        time: '09:00',
        board: 'product-roadmap'
    }
];

// Removed auto-initialization - React components will call these functions manually
// document.addEventListener('DOMContentLoaded', function() {
//     initializeCalendar();
//     initializeMobileEnhancements();
// });

function initializeCalendar() {
    initializeViewToggle();
    initializeNavigation();
    initializeEventForm();
    renderCalendar();
    updateCalendarPeriod();
}

// Make function available globally
window.initializeCalendar = initializeCalendar;

// Mobile-specific enhancements
function initializeMobileEnhancements() {
    // Add touch support for better mobile interaction
    addTouchSupport();
    
    // Optimize for mobile screen sizes
    handleMobileViewportChanges();
}

// Make function available globally
window.initializeMobileEnhancements = initializeMobileEnhancements;

function addTouchSupport() {
    // Add touch event handling for calendar days
    const calendarContainer = document.getElementById('calendar-days');
    if (calendarContainer) {
        calendarContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        calendarContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
}

let touchStartTime = 0;

function handleTouchStart(e) {
    touchStartTime = Date.now();
}

function handleTouchEnd(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Only handle quick taps (not long presses or swipes)
    if (touchDuration < 200) {
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && calendarDay.classList.contains('calendar-day')) {
            // Add visual feedback for touch
            calendarDay.style.backgroundColor = 'var(--bg-secondary)';
            setTimeout(() => {
                calendarDay.style.backgroundColor = '';
            }, 150);
        }
    }
}

function renderAgendaView() {
    const agendaView = document.getElementById('agenda-view');
    if (!agendaView) return;
    
    // Get events for current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Filter events for current month
    const monthEvents = sampleEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= firstDay && eventDate <= lastDay;
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    // Group events by date
    const groupedEvents = {};
    monthEvents.forEach(event => {
        if (!groupedEvents[event.date]) {
            groupedEvents[event.date] = [];
        }
        groupedEvents[event.date].push(event);
    });
    
    // Render agenda
    agendaView.innerHTML = '';
    
    if (Object.keys(groupedEvents).length === 0) {
        agendaView.innerHTML = '<div class="no-events">No events this month</div>';
        return;
    }
    
    Object.keys(groupedEvents).forEach(dateKey => {
        const date = new Date(dateKey);
        const dayEvents = groupedEvents[dateKey];
        
        const daySection = document.createElement('div');
        daySection.className = 'agenda-day-section';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'agenda-day-header';
        dayHeader.innerHTML = `
            <div class="agenda-date">${date.getDate()}</div>
            <div class="agenda-day-name">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short' })}</div>
        `;
        
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'agenda-events';
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'agenda-event';
            eventElement.innerHTML = `
                <div class="agenda-event-time">${formatEventTime(event.time)}</div>
                <div class="agenda-event-details">
                    <div class="agenda-event-title">${event.title}</div>
                    <div class="agenda-event-description">${event.description}</div>
                </div>
            `;
            
            eventElement.addEventListener('click', () => showEventDetails(event));
            eventsContainer.appendChild(eventElement);
        });
        
        daySection.appendChild(dayHeader);
        daySection.appendChild(eventsContainer);
        agendaView.appendChild(daySection);
    });
}

function formatEventTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

function handleMobileViewportChanges() {
    // Handle orientation changes on mobile
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            renderCalendar();
        }, 100);
    });
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', debounce(function() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Ensure mobile optimizations are active
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
            // Reset to calendar view on desktop
            const monthlyView = document.getElementById('monthly-view');
            const agendaView = document.getElementById('agenda-view');
            const toggleBtn = document.getElementById('mobile-view-toggle');
            
            if (monthlyView) monthlyView.style.display = 'block';
            if (agendaView) agendaView.style.display = 'none';
            if (toggleBtn) {
                toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
                toggleBtn.title = 'Switch to Agenda View';
            }
        }
        renderCalendar();
    }, 250));
}

// View Toggle
function initializeViewToggle() {
    const viewButtons = document.querySelectorAll('.view-toggle-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            switchView(view);
        });
    });
}

function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.monthly-view, .weekly-view, .daily-view, .agenda-view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });
    
    // Show selected view
    const viewElement = document.getElementById(`${view}-view`);
    if (viewElement) {
        viewElement.classList.add('active');
        viewElement.style.display = 'block';
    }
    
    // Render appropriate view
    switch(view) {
        case 'monthly':
            renderMonthlyView();
            break;
        case 'weekly':
            renderWeeklyView();
            break;
        case 'daily':
            renderDailyView();
            break;
        case 'agenda':
            renderAgendaView();
            break;
        default:
            renderMonthlyView(); // Default to monthly view
            break;
    }
    
    updateCalendarPeriod();
}

// Navigation
function initializeNavigation() {
    document.getElementById('prev-btn').addEventListener('click', navigatePrevious);
    document.getElementById('next-btn').addEventListener('click', navigateNext);
}

function navigatePrevious() {
    switch(currentView) {
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() - 1);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() - 7);
            break;
        case 'daily':
            currentDate.setDate(currentDate.getDate() - 1);
            break;
        default:
            // Default to monthly navigation
            currentDate.setMonth(currentDate.getMonth() - 1);
            break;
    }
    renderCalendar();
    updateCalendarPeriod();
}

function navigateNext() {
    switch(currentView) {
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
        case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        default:
            // Default to monthly navigation
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
    }
    renderCalendar();
    updateCalendarPeriod();
}

function updateCalendarPeriod() {
    const periodElement = document.getElementById('calendar-period');
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    switch(currentView) {
        case 'monthly':
        case 'agenda':
            periodElement.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            break;
        case 'weekly':
            const weekStart = getWeekStart(currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            if (weekStart.getMonth() === weekEnd.getMonth()) {
                periodElement.textContent = `${months[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            } else {
                periodElement.textContent = `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            }
            break;
        case 'daily':
            periodElement.textContent = `${days[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
            break;
        default:
            // Default to monthly format
            periodElement.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            break;
    }
}

// Render Calendar
function renderCalendar() {
    switch(currentView) {
        case 'monthly':
            renderMonthlyView();
            break;
        case 'weekly':
            renderWeeklyView();
            break;
        case 'daily':
            renderDailyView();
            break;
        default:
            // Default to monthly view
            renderMonthlyView();
            break;
    }
}

function renderMonthlyView() {
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0); // Not used but might be needed later
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Add classes
        if (date.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Events for this day
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        
        const eventsForDay = getEventsForDate(date);
        
        // Show maximum 2 events to prevent layout issues
        const maxEvents = 2;
        eventsForDay.slice(0, maxEvents).forEach(event => {
            const eventElement = createEventElement(event);
            dayEvents.appendChild(eventElement);
        });
        
        if (eventsForDay.length > maxEvents) {
            const moreEvents = document.createElement('div');
            moreEvents.className = 'more-events';
            moreEvents.textContent = `+${eventsForDay.length - maxEvents} more`;
            moreEvents.addEventListener('click', function(e) {
                e.stopPropagation();
                showDayEventsModal(date, eventsForDay);
            });
            dayEvents.appendChild(moreEvents);
        }
        
        dayElement.appendChild(dayEvents);
        
        // Click handler
        dayElement.addEventListener('click', function() {
            selectDate(date);
        });
        
        calendarDays.appendChild(dayElement);
    }
}

function renderWeeklyView() {
    const weeklyGrid = document.getElementById('weekly-grid');
    weeklyGrid.innerHTML = '';
    
    const weekStart = getWeekStart(currentDate);
    const hours = [];
    
    // Generate time slots
    for (let hour = 8; hour < 18; hour++) {
        hours.push(hour);
    }
    
    hours.forEach(hour => {
        // Time slot
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = formatHour(hour);
        weeklyGrid.appendChild(timeSlot);
        
        // Day columns
        for (let day = 0; day < 7; day++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + day);
            
            const dayColumn = document.createElement('div');
            dayColumn.className = 'weekly-day-column';
            
            // Find events for this hour and day
            const eventsForSlot = getEventsForDateAndHour(date, hour);
            eventsForSlot.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'weekly-event';
                eventElement.textContent = event.title;
                eventElement.style.top = '2px';
                eventElement.style.height = '56px';
                
                eventElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showEventDetails(event);
                });
                
                dayColumn.appendChild(eventElement);
            });
            
            dayColumn.addEventListener('click', function() {
                createEventAtTime(date, hour);
            });
            
            weeklyGrid.appendChild(dayColumn);
        }
    });
    
    // Update weekly header
    updateWeeklyHeader(weekStart);
}

function renderDailyView() {
    const dailyView = document.getElementById('daily-view');
    const dailyHeader = dailyView.querySelector('.daily-header');
    
    // Update daily header
    const dailyDate = dailyHeader.querySelector('.daily-date');
    const dailyDayName = dailyHeader.querySelector('.daily-day-name');
    
    dailyDate.textContent = currentDate.getDate();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dailyDayName.textContent = `${days[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Update daily schedule with events
    const dailySchedule = dailyView.querySelector('.daily-schedule');
    const eventsForDay = getEventsForDate(currentDate);
    
    // Clear existing events and rebuild
    const timeSlots = dailySchedule.querySelectorAll('.daily-time-slot');
    timeSlots.forEach(slot => {
        const eventsContainer = slot.querySelector('.daily-events');
        eventsContainer.innerHTML = '';
    });
    
    // Add events to appropriate time slots
    eventsForDay.forEach(event => {
        const eventHour = parseInt(event.time.split(':')[0]);
        const timeSlot = Array.from(timeSlots).find(slot => {
            const slotTime = slot.querySelector('.daily-time').textContent;
            // Convert 12-hour format to 24-hour for comparison
            let slotHour = parseInt(slotTime.split(':')[0]);
            const isPM = slotTime.includes('PM');
            
            if (isPM && slotHour !== 12) {
                slotHour += 12;
            } else if (!isPM && slotHour === 12) {
                slotHour = 0;
            }
            
            return slotHour === eventHour;
        });
        
        if (timeSlot) {
            const eventsContainer = timeSlot.querySelector('.daily-events');
            const eventElement = document.createElement('div');
            eventElement.className = 'daily-event';
            eventElement.innerHTML = `
                <div class="daily-event-title">${event.title}</div>
                <div class="daily-event-details">${event.description}</div>
                <div class="daily-event-due">Due: ${formatEventDateTime(event.date, event.time)}</div>
            `;
            
            eventElement.addEventListener('click', function() {
                showEventDetails(event);
            });
            
            eventsContainer.appendChild(eventElement);
        }
    });
}

// Helper Functions
function getWeekStart(date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return start;
}

function formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${ampm}`;
}

function formatEventDateTime(dateString, timeString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;
    
    return `${month} ${day}, ${year} at ${formattedTime}`;
}

function getEventsForDate(date) {
    // Format date as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return sampleEvents.filter(event => event.date === dateString);
}

function getEventsForDateAndHour(date, hour) {
    // Format date as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return sampleEvents.filter(event => {
        if (event.date !== dateString) return false;
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
    });
}

function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = 'calendar-event';
    
    // Simplified: just show title to prevent layout issues
    eventElement.textContent = event.title;
    eventElement.title = `${event.title}\nDue: ${formatEventDateTime(event.date, event.time)}\n${event.description}`;
    
    eventElement.addEventListener('click', function(e) {
        e.stopPropagation();
        showEventDetails(event);
    });
    
    return eventElement;
}

function updateWeeklyHeader(weekStart) {
    const headers = document.querySelectorAll('.weekly-day-header');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    headers.forEach((header, index) => {
        if (index === 0) return; // Skip time column
        
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + (index - 1));
        
        const dayNumber = header.querySelector('.weekly-day-number');
        const dayName = header.querySelector('.weekly-day-name');
        
        dayNumber.textContent = date.getDate();
        dayName.textContent = days[date.getDay()];
    });
}

function selectDate(date, event) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Add selection to clicked day
    if (event && event.target) {
        const calendarDay = event.target.closest('.calendar-day');
        if (calendarDay) {
            calendarDay.classList.add('selected');
        }
    }
    
    // Switch to daily view for selected date
    currentDate = new Date(date);
    switchView('daily');
}

function createEventAtTime(date, hour) {
    currentDate = new Date(date);
    
    // Pre-fill the event form
    const eventForm = document.getElementById('event-form');
    const dateInput = eventForm.querySelector('input[type="date"]');
    const timeInput = eventForm.querySelector('input[type="time"]');
    
    const selectedDateString = date.toISOString().split('T')[0];
    const selectedTimeString = `${hour.toString().padStart(2, '0')}:00`;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Check if the selected date/time is in the past
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDateString}T${selectedTimeString}`);
    
    if (selectedDateTime <= now) {
        // If the selected time is in the past, set to current time + 1 hour
        const futureTime = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
        dateInput.value = futureTime.toISOString().split('T')[0];
        timeInput.value = futureTime.toTimeString().slice(0, 5);
    } else {
        dateInput.value = selectedDateString;
        timeInput.value = selectedTimeString;
    }
    
    openModal('event-modal');
}

function showEventDetails(event) {
    // Create a detailed event modal (simplified for demo)
    const modal = document.createElement('div');
    modal.className = 'modal event-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${event.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Description:</strong> ${event.description}</p>
                <p><strong>Due Date:</strong> ${formatEventDateTime(event.date, event.time)}</p>
                ${event.board ? `<p><strong>Board:</strong> ${event.board}</p>` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn btn-primary" onclick="editEvent(${event.id})">Edit Event</button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete Event</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function showDayEventsModal(date, events) {
    const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let eventsHTML = '';
    events.forEach(event => {
        eventsHTML += `
            <div class="day-event-item" onclick="showEventFromModal(${event.id})" style="cursor: pointer; padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 6px; border-left: 4px solid var(--primary-color);">
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${event.title}</div>
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">${event.description}</div>
                <div style="font-size: 0.75rem; color: var(--primary-color);">${formatEventDateTime(event.date, event.time)}</div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Events for ${dateStr}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                ${eventsHTML}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('active');
}

function showEventFromModal(eventId) {
    // Close the day events modal first
    const dayModal = document.querySelector('.modal');
    if (dayModal) {
        dayModal.remove();
    }
    
    // Find and show the specific event
    const event = sampleEvents.find(e => e.id === eventId);
    if (event) {
        showEventDetails(event);
    }
}

// Make function available globally
window.showEventFromModal = showEventFromModal;

// Priority Selection - REMOVED

// Event Form
function initializeEventForm() {
    const eventForm = document.getElementById('event-form');
    
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEventSubmit();
    });
    
    // Initialize deadline validation for the event form
    initializeCalendarDeadlineValidation();
}

function handleEventSubmit() {
    const form = document.getElementById('event-form');
    
    const title = form.querySelector('input[type="text"]').value.trim();
    const description = form.querySelector('textarea').value.trim();
    const dueDate = form.querySelector('input[type="date"]').value;
    const dueTime = form.querySelector('input[type="time"]').value;
    
    if (!title || !dueDate || !dueTime) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate that the deadline is not in the past
    const now = new Date();
    const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
    
    if (selectedDateTime <= now) {
        showCalendarDeadlineErrorModal('Event date and time cannot be in the past. Please select a future date and time.');
        return;
    }
    
    if (currentEditingEvent) {
        // Store old date to check if it changed
        const oldDate = currentEditingEvent.date;
        
        // Update existing event
        currentEditingEvent.title = title;
        currentEditingEvent.description = description;
        currentEditingEvent.date = dueDate;
        currentEditingEvent.time = dueTime;
        
        // If date changed, navigate to the new date
        if (oldDate !== dueDate) {
            // Parse the date correctly to avoid timezone issues
            const dateParts = dueDate.split('-');
            const newDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            currentDate = newDate;
            
            console.log('Moving event from', oldDate, 'to', dueDate);
            console.log('New date object:', newDate);
            console.log('New date display:', newDate.toDateString());
            
            // Switch to monthly view to show the new date
            if (currentView !== 'monthly') {
                switchView('monthly');
            } else {
                // If already in monthly view, just re-render
                renderCalendar();
            }
            
            updateCalendarPeriod();
            showNotification('Event updated and moved to ' + newDate.toLocaleDateString() + '!', 'success');
        } else {
            showNotification('Event updated successfully!', 'success');
        }
        
        // Reset editing state
        currentEditingEvent = null;
        
        // Reset modal appearance
        const modal = document.getElementById('event-modal');
        const modalTitle = modal.querySelector('h3');
        const submitButton = modal.querySelector('button[type="submit"]');
        const cancelEditBtn = modal.querySelector('.cancel-edit-btn');
        const regularCancelBtn = modal.querySelector('button[onclick*="closeModal"]');
        
        if (modalTitle) modalTitle.textContent = 'Add New Event';
        if (submitButton) submitButton.textContent = 'Create Event';
        
        // Hide cancel edit button and show regular cancel button
        if (cancelEditBtn) {
            cancelEditBtn.style.display = 'none';
        }
        if (regularCancelBtn) {
            regularCancelBtn.style.display = 'inline-block';
        }
    } else {
        // Create new event
        const newEvent = {
            id: sampleEvents.length > 0 ? Math.max(...sampleEvents.map(e => e.id)) + 1 : 1,
            title: title,
            description: description,
            date: dueDate,
            time: dueTime,
            board: null
        };
        
        // Add to events array
        sampleEvents.push(newEvent);
        
        showNotification('Event created successfully!', 'success');
    }
    
    // Close modal and refresh calendar
    closeModal(document.getElementById('event-modal'));
    form.reset();
    
    // Always re-render the calendar to show changes
    renderCalendar();
}

// Search functionality
function initializeCalendarSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleCalendarSearch, 300));
    }
}

function handleCalendarSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderCalendar();
        return;
    }
    
    // Filter events based on search query
    const filteredEvents = sampleEvents.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    );
    
    // Temporarily replace sample events for rendering
    const originalEvents = [...sampleEvents];
    sampleEvents.length = 0;
    sampleEvents.push(...filteredEvents);
    
    renderCalendar();
    
    // Show search results notification
    if (filteredEvents.length === 0) {
        showNotification('No events found matching your search', 'info');
    } else {
        showNotification(`Found ${filteredEvents.length} event(s)`, 'success');
    }
    
    // Restore original events after a delay
    setTimeout(() => {
        sampleEvents.length = 0;
        sampleEvents.push(...originalEvents);
    }, 5000);
}

// Utility function for debouncing
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

// Initialize search
initializeCalendarSearch();

// Google Calendar API Initialization - Simulated for demo
function initializeGoogleAPI() {
    // Simulated initialization - no actual API calls
    // isGoogleApiLoaded = true; // Reserved for future use
    checkGoogleSignInStatus();
}

function checkGoogleSignInStatus() {
    // Simulated check - default to not signed in
    isGoogleSignedIn = false;
    updateSyncUI(false);
}

function updateSyncUI(connected) {
    const syncOptions = document.getElementById('sync-options');
    const syncConnected = document.getElementById('sync-connected');
    const connectBtn = document.getElementById('connect-google-btn');
    const saveBtn = document.getElementById('save-sync-settings');
    
    if (connected) {
        if (syncOptions) syncOptions.style.display = 'none';
        if (syncConnected) syncConnected.style.display = 'block';
        if (connectBtn) connectBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'inline-block';
    } else {
        if (syncOptions) syncOptions.style.display = 'block';
        if (syncConnected) syncConnected.style.display = 'none';
        if (connectBtn) connectBtn.style.display = 'inline-block';
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function connectToGoogle() {
    // Simulate successful connection for demo purposes
    isGoogleSignedIn = true;
    updateSyncUI(true);
    
    showNotification('Successfully connected to Google Calendar!', 'success');
}

function disconnectFromGoogle() {
    // Simulate disconnection for demo purposes
    isGoogleSignedIn = false;
    updateSyncUI(false);
    document.getElementById('last-sync').textContent = 'Never';
    showNotification('Disconnected from Google Calendar', 'info');
    closeModal(document.getElementById('google-sync-modal'));
}

function loadGoogleCalendars() {
    if (!isGoogleSignedIn) return;
    
    // Fallback for when Google API is not available
    if (typeof window.gapi === 'undefined' || !window.gapi.client) {
        console.warn('Google API not available');
        return;
    }
    
    window.gapi.client.load('calendar', 'v3', function() {
        window.gapi.client.calendar.calendarList.list().then(function(response) {
            googleCalendarList = response.result.items;
            populateCalendarSelect();
        });
    });
}

// Make function available globally
window.loadGoogleCalendars = loadGoogleCalendars;

function populateCalendarSelect() {
    const select = document.getElementById('google-calendar-select');
    select.innerHTML = '<option value="">Select a calendar...</option>';
    
    googleCalendarList.forEach(function(calendar) {
        const option = document.createElement('option');
        option.value = calendar.id;
        option.textContent = calendar.summary;
        if (calendar.primary) {
            option.textContent += ' (Primary)';
        }
        select.appendChild(option);
    });
}

function syncToGoogle() {
    if (!isGoogleSignedIn) {
        showNotification('Please connect to Google Calendar first', 'error');
        return;
    }
    
    const selectedCalendar = document.getElementById('google-calendar-select').value;
    if (!selectedCalendar) {
        showNotification('Please select a Google Calendar', 'error');
        return;
    }
    
    showNotification('Syncing events to Google Calendar...', 'info');
    
    // Convert WorkShift events to Google Calendar format
    const promises = sampleEvents.map(function(event) {
        const googleEvent = {
            summary: event.title,
            description: event.description,
            start: {
                dateTime: `${event.date}T${event.time}:00`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
                dateTime: `${event.date}T${addHourToTime(event.time)}:00`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };
        
        return window.gapi.client.calendar.events.insert({
            calendarId: selectedCalendar,
            resource: googleEvent
        });
    });
    
    Promise.all(promises).then(function() {
        document.getElementById('last-sync').textContent = new Date().toLocaleString();
        showNotification('Successfully synced events to Google Calendar!', 'success');
    }).catch(function(error) {
        console.error('Sync error:', error);
        showNotification('Failed to sync some events', 'error');
    });
}

// Make function available globally
window.syncToGoogle = syncToGoogle;

function syncFromGoogle() {
    if (!isGoogleSignedIn) {
        showNotification('Please connect to Google Calendar first', 'error');
        return;
    }
    
    const selectedCalendar = document.getElementById('google-calendar-select').value;
    if (!selectedCalendar) {
        showNotification('Please select a Google Calendar', 'error');
        return;
    }
    
    showNotification('Importing events from Google Calendar...', 'info');
    
    // Get events from Google Calendar
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // Next 60 days
    
    window.gapi.client.calendar.events.list({
        calendarId: selectedCalendar,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime'
    }).then(function(response) {
        const googleEvents = response.result.items;
        let importedCount = 0;
        
        googleEvents.forEach(function(googleEvent) {
            if (googleEvent.start && googleEvent.start.dateTime) {
                const startDateTime = new Date(googleEvent.start.dateTime);
                const newEvent = {
                    id: sampleEvents.length + importedCount + 1,
                    title: googleEvent.summary || 'Untitled Event',
                    description: googleEvent.description || '',
                    date: startDateTime.toISOString().split('T')[0],
                    time: startDateTime.toTimeString().slice(0, 5),
                    board: null
                };
                
                // Check if event already exists
                const exists = sampleEvents.some(event => 
                    event.title === newEvent.title && 
                    event.date === newEvent.date && 
                    event.time === newEvent.time
                );
                
                if (!exists) {
                    sampleEvents.push(newEvent);
                    importedCount++;
                }
            }
        });
        
        if (importedCount > 0) {
            renderCalendar();
            document.getElementById('last-sync').textContent = new Date().toLocaleString();
            showNotification(`Imported ${importedCount} events from Google Calendar!`, 'success');
        } else {
            showNotification('No new events to import', 'info');
        }
    }).catch(function(error) {
        console.error('Import error:', error);
        showNotification('Failed to import events from Google Calendar', 'error');
    });
}

// Make function available globally
window.syncFromGoogle = syncFromGoogle;

function toggleAutoSync() {
    if (!isGoogleSignedIn) {
        showNotification('Please connect to Google Calendar first', 'error');
        return;
    }
    
    autoSyncEnabled = !autoSyncEnabled;
    const toggleBtn = document.getElementById('auto-sync-toggle');
    
    if (autoSyncEnabled) {
        toggleBtn.innerHTML = '<i class="fas fa-toggle-on"></i> Auto Sync: ON';
        toggleBtn.classList.remove('btn-primary');
        toggleBtn.classList.add('btn-success');
        showNotification('Auto sync enabled - will sync every hour', 'success');
        
        // Simulate immediate sync when enabled
        setTimeout(() => {
            document.getElementById('last-sync').textContent = new Date().toLocaleString();
            showNotification('Initial sync completed', 'info');
        }, 1500);
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-toggle-off"></i> Auto Sync: OFF';
        toggleBtn.classList.remove('btn-success');
        toggleBtn.classList.add('btn-primary');
        showNotification('Auto sync disabled', 'info');
    }
}

// Event Listeners for Google Calendar sync
document.addEventListener('DOMContentLoaded', function() {
    // Initialize simulated Google API when page loads
    setTimeout(initializeGoogleAPI, 1000);
    
    // Connect to Google button
    const connectBtn = document.getElementById('connect-google-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectToGoogle);
    }
    
    // Disconnect button
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectFromGoogle);
    }
    
    // Auto sync toggle button
    const autoSyncToggle = document.getElementById('auto-sync-toggle');
    if (autoSyncToggle) {
        autoSyncToggle.addEventListener('click', toggleAutoSync);
    }
    
    // Save sync settings button
    const saveSettingsBtn = document.getElementById('save-sync-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            showNotification('Sync settings saved!', 'success');
            closeModal(document.getElementById('google-sync-modal'));
        });
    }
});

// Calendar Deadline Validation Functions
function initializeCalendarDeadlineValidation() {
    const dateInput = document.getElementById('event-due-date');
    const timeInput = document.getElementById('event-due-time');
    const errorElement = document.getElementById('event-deadline-validation-error');
    
    if (!dateInput || !timeInput || !errorElement) {
        console.warn('Calendar deadline validation: Required elements not found');
        return;
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Function to validate deadline
    function validateCalendarDeadline() {
        const selectedDate = dateInput.value;
        const selectedTime = timeInput.value;
        
        if (!selectedDate || !selectedTime) {
            // Clear error if no date/time selected
            hideCalendarDeadlineError();
            return true;
        }
        
        const now = new Date();
        const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
        
        // Check if selected date and time is in the past
        if (selectedDateTime <= now) {
            showCalendarDeadlineErrorModal('Event date and time cannot be in the past. Please select a future date and time.');
            return false;
        }
        
        // Clear error if validation passes
        hideCalendarDeadlineError();
        return true;
    }
    
    // Function to update time constraints based on selected date
    function updateCalendarTimeConstraints() {
        const selectedDate = dateInput.value;
        const today = new Date().toISOString().split('T')[0];
        
        if (selectedDate === today) {
            // If today is selected, set minimum time to current time
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            timeInput.min = currentTime;
            
            // If current time value is less than minimum, update it
            if (timeInput.value && timeInput.value <= currentTime) {
                // Add 1 minute to current time as minimum
                now.setMinutes(now.getMinutes() + 1);
                timeInput.value = now.toTimeString().slice(0, 5);
            }
        } else {
            // Remove time constraints for future dates
            timeInput.removeAttribute('min');
        }
        
        // Validate after updating constraints
        validateCalendarDeadline();
    }
    
    // Add event listeners
    dateInput.addEventListener('change', function() {
        updateCalendarTimeConstraints();
        validateCalendarDeadline();
    });
    
    timeInput.addEventListener('change', validateCalendarDeadline);
    timeInput.addEventListener('input', validateCalendarDeadline);
    
    // Initial validation and constraint setup
    updateCalendarTimeConstraints();
    
    console.log('Calendar deadline validation initialized');
}

function showCalendarDeadlineError(message) {
    const errorElement = document.getElementById('event-deadline-validation-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    // Show modal-style error
    showCalendarDeadlineErrorModal(message);
}

// Make function available globally
window.showCalendarDeadlineError = showCalendarDeadlineError;

function hideCalendarDeadlineError() {
    const errorElement = document.getElementById('event-deadline-validation-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function showCalendarDeadlineErrorModal(message) {
    // Remove any existing deadline error modals
    const existingModal = document.querySelector('.calendar-deadline-error-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Close any open time picker dropdowns
    closeTimePickers();
    
    // Create modal-style error notification
    const modal = document.createElement('div');
    modal.className = 'modal calendar-deadline-error-modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; margin: 20vh auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
            <div class="modal-header" style="background: #ffffff; padding: 20px 24px 16px; border-bottom: 1px solid #e5e5e5; border-radius: 8px 8px 0 0; position: relative;">
                <h3 style="margin: 0; color: #333; font-weight: 500; font-size: 1.125rem;">Invalid Event Time</h3>
                <button class="modal-close" onclick="closeCalendarDeadlineErrorModal()" style="position: absolute; right: 16px; top: 16px; color: #999; background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 4px; line-height: 1;" onmouseover="this.style.color='#666'" onmouseout="this.style.color='#999'">&times;</button>
            </div>
            <div class="modal-body" style="padding: 24px; background: #ffffff;">
                <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #555;">${message}</p>
            </div>
            <div class="modal-footer" style="padding: 16px 24px; background: #ffffff; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px; display: flex; justify-content: flex-end;">
                <button class="btn btn-danger" onclick="closeCalendarDeadlineErrorModal()" style="background: #dc3545; color: white; border: 1px solid #dc3545; padding: 8px 16px; border-radius: 4px; font-size: 0.875rem; cursor: pointer;">Confirm</button>
            </div>
        </div>

    `;
    
    document.body.appendChild(modal);
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCalendarDeadlineErrorModal();
        }
    });
    
    // Add escape key to close
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            closeCalendarDeadlineErrorModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    

}

function closeCalendarDeadlineErrorModal() {
    const modal = document.querySelector('.calendar-deadline-error-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function closeTimePickers() {
    // Close any open time input dropdowns by blurring focused time inputs
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        if (document.activeElement === input) {
            input.blur();
        }
    });
    
    // Also close any date input dropdowns
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (document.activeElement === input) {
            input.blur();
        }
    });
    
    // Remove focus from any form elements that might have dropdowns open
    if (document.activeElement && (
        document.activeElement.type === 'time' || 
        document.activeElement.type === 'date'
    )) {
        document.activeElement.blur();
    }
}

// Edit Event Functionality
let currentEditingEvent = null;

function editEvent(eventId) {
    console.log('editEvent called with ID:', eventId);
    console.log('DOM ready state:', document.readyState);
    
    const event = sampleEvents.find(e => e.id === eventId);
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    currentEditingEvent = event;
    
    // Close any existing dynamically created modals (but not the static event modal)
    document.querySelectorAll('.modal:not(#event-modal)').forEach(modal => modal.remove());
    
    // Ensure DOM is ready and then find the modal
    function findAndOpenModal() {
        const modal = document.getElementById('event-modal');
        if (!modal) {
            console.error('Event modal not found. Available elements with event-modal:', document.querySelectorAll('[id*="event"]'));
            console.error('All modals found:', document.querySelectorAll('.modal'));
            console.error('Document body children:', document.body.children);
            return false;
        }
        
        console.log('Modal found:', modal);
        
        // Use the openModal function from shared.js
        openModal('event-modal');
        
        // Use requestAnimationFrame to ensure DOM is updated after modal opens
        requestAnimationFrame(() => {
            const eventForm = document.getElementById('event-form');
            if (!eventForm) {
                console.error('Event form not found after modal open');
                console.error('Available forms:', document.querySelectorAll('form'));
                console.error('Modal active?', modal.classList.contains('active'));
                console.error('Modal element:', modal);
                return;
            }
            
            populateEventForm(event, eventForm);
        });
        
        return true;
    }
    
    // Try to find modal immediately, if not found, wait a bit
    if (!findAndOpenModal()) {
        setTimeout(() => {
            if (!findAndOpenModal()) {
                console.error('Failed to find modal even after timeout');
                showNotification('Unable to open edit form', 'error');
            }
        }, 100);
    }
}

function populateEventForm(event, eventForm) {
    const modal = document.getElementById('event-modal');
    
    const titleInput = eventForm.querySelector('input[type="text"]');
    const descriptionInput = eventForm.querySelector('textarea');
    const dateInput = eventForm.querySelector('input[type="date"]');
    const timeInput = eventForm.querySelector('input[type="time"]');
    
    if (titleInput) titleInput.value = event.title;
    if (descriptionInput) descriptionInput.value = event.description;
    if (dateInput) dateInput.value = event.date;
    if (timeInput) timeInput.value = event.time;
    
    // Change modal title and button text
    if (modal) {
        const modalTitle = modal.querySelector('h3');
        const submitButton = modal.querySelector('button[type="submit"]');
        
        if (modalTitle) modalTitle.textContent = 'Edit Event';
        if (submitButton) submitButton.textContent = 'Update Event';
        
        // Hide the regular cancel button and add cancel edit button
        const modalFooter = modal.querySelector('.modal-footer');
        if (modalFooter) {
            // Hide the regular cancel button
            const regularCancelBtn = modalFooter.querySelector('button[onclick*="closeModal"]');
            if (regularCancelBtn) {
                regularCancelBtn.style.display = 'none';
            }
            
            // Add or show cancel edit button
            let cancelEditBtn = modalFooter.querySelector('.cancel-edit-btn');
            if (!cancelEditBtn) {
                cancelEditBtn = document.createElement('button');
                cancelEditBtn.type = 'button';
                cancelEditBtn.className = 'btn btn-secondary cancel-edit-btn';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.onclick = cancelEditEvent;
                const submitButton = modalFooter.querySelector('button[type="submit"]');
                if (submitButton) {
                    modalFooter.insertBefore(cancelEditBtn, submitButton);
                }
            } else {
                cancelEditBtn.style.display = 'inline-block';
            }
        }
    }
}

// Make function available globally
window.editEvent = editEvent;

function cancelEditEvent() {
    currentEditingEvent = null;
    
    // Reset modal title and button text
    const modal = document.getElementById('event-modal');
    const modalTitle = modal.querySelector('h3');
    const submitButton = modal.querySelector('button[type="submit"]');
    const cancelEditBtn = modal.querySelector('.cancel-edit-btn');
    const regularCancelBtn = modal.querySelector('button[onclick*="closeModal"]');
    
    if (modalTitle) modalTitle.textContent = 'Add New Event';
    if (submitButton) submitButton.textContent = 'Create Event';
    
    // Hide cancel edit button and show regular cancel button
    if (cancelEditBtn) {
        cancelEditBtn.style.display = 'none';
    }
    if (regularCancelBtn) {
        regularCancelBtn.style.display = 'inline-block';
    }
    
    // Reset form
    const form = document.getElementById('event-form');
    if (form) form.reset();
    
    closeModal(modal);
}

function deleteEvent(eventId) {
    const event = sampleEvents.find(e => e.id === eventId);
    if (!event) {
        showNotification('Event not found', 'error');
        return;
    }
    
    // Close any existing modals
    document.querySelectorAll('.modal').forEach(modal => modal.remove());
    
    // Show confirmation dialog
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal delete-confirmation-modal';
    confirmModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Delete Event</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete "<strong>${event.title}</strong>"?</p>
                <p style="color: #666; font-size: 0.9rem;">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDeleteEvent(${eventId})">Delete Event</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    confirmModal.classList.add('active');
}

// Make function available globally
window.deleteEvent = deleteEvent;

function confirmDeleteEvent(eventId) {
    const eventIndex = sampleEvents.findIndex(e => e.id === eventId);
    if (eventIndex > -1) {
        const event = sampleEvents[eventIndex];
        sampleEvents.splice(eventIndex, 1);
        
        // Close modal and refresh calendar
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
        renderCalendar();
        
        showNotification(`Event "${event.title}" deleted successfully`, 'success');
    }
}

// Make function available globally
window.confirmDeleteEvent = confirmDeleteEvent;

// Modal close handler to reset edit state
function handleEventModalClose() {
    if (currentEditingEvent) {
        // Reset editing state
        currentEditingEvent = null;
        
        // Reset modal appearance
        const modal = document.getElementById('event-modal');
        const modalTitle = modal.querySelector('h3');
        const submitButton = modal.querySelector('button[type="submit"]');
        const cancelEditBtn = modal.querySelector('.cancel-edit-btn');
        const regularCancelBtn = modal.querySelector('button[onclick*="closeModal"]');
        
        if (modalTitle) modalTitle.textContent = 'Add New Event';
        if (submitButton) submitButton.textContent = 'Create Event';
        
        // Hide cancel edit button and show regular cancel button
        if (cancelEditBtn) {
            cancelEditBtn.style.display = 'none';
        }
        if (regularCancelBtn) {
            regularCancelBtn.style.display = 'inline-block';
        }
        
        // Reset form
        const form = document.getElementById('event-form');
        if (form) form.reset();
    }
}

// Add event listener to handle modal close properly
document.addEventListener('DOMContentLoaded', function() {
    const eventModal = document.getElementById('event-modal');
    if (eventModal) {
        // Add click outside to close with reset
        eventModal.addEventListener('click', function(e) {
            if (e.target === eventModal) {
                handleEventModalClose();
            }
        });
        
        // Add escape key to close with reset
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && eventModal.classList.contains('active')) {
                handleEventModalClose();
            }
        });
        
        // Handle close button click
        const closeButton = eventModal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', handleEventModalClose);
        }
        
        // Handle cancel button click
        const cancelButton = eventModal.querySelector('button[onclick*="closeModal"]');
        if (cancelButton) {
            cancelButton.addEventListener('click', handleEventModalClose);
        }
    }
});
