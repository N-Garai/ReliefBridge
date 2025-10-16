// Professional ReliefBridge JavaScript
// Enhanced functionality for disaster relief coordination

class ReliefBridge {
    constructor() {
        this.appwriteClient = null;
        this.realTimeSubscriptions = [];
        this.notificationPermission = 'default';
        this.init();
    }

    // Initialize the application
    init() {
        this.initializeAppwrite();
        this.setupNotifications();
        this.initializeUIComponents();
        this.startRealTimeUpdates();
        this.setupAutoSave();
        this.initializeServiceWorker();

        console.log('ReliefBridge Professional initialized');
    }

    // Initialize Appwrite client
    initializeAppwrite() {
        if (typeof Appwrite !== 'undefined') {
            this.appwriteClient = new Appwrite.Client()
                .setEndpoint(window.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
                .setProject(window.APPWRITE_PROJECT_ID || 'reliefbridge');
        }
    }

    // Setup browser notifications
    setupNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    this.notificationPermission = permission;
                    if (permission === 'granted') {
                        this.showWelcomeNotification();
                    }
                });
            } else {
                this.notificationPermission = Notification.permission;
            }
        }
    }

    // Show welcome notification
    showWelcomeNotification() {
        const userName = document.querySelector('.user-name')?.textContent || 'User';
        this.showNotification(
            'Welcome to ReliefBridge',
            `Hello ${userName}! You'll receive real-time updates about emergency requests.`,
            '/static/images/logo.png'
        );
    }

    // Enhanced notification system
    showNotification(title, body, icon = null, actions = []) {
        if (this.notificationPermission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: icon || '/static/images/notification-icon.png',
                badge: '/static/images/badge-icon.png',
                tag: 'reliefbridge-notification',
                requireInteraction: title.includes('URGENT'),
                silent: false,
                vibrate: title.includes('URGENT') ? [200, 100, 200] : [100],
                actions: actions
            });

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                notification.close();
            };

            // Auto-close after 10 seconds for non-urgent notifications
            if (!title.includes('URGENT')) {
                setTimeout(() => notification.close(), 10000);
            }

            return notification;
        }
    }

    // Initialize UI components
    initializeUIComponents() {
        this.initializeTooltips();
        this.initializePopovers();
        this.initializeModals();
        this.setupFormValidation();
        this.initializeAnimations();
        this.setupKeyboardNavigation();
    }

    // Initialize Bootstrap tooltips
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                trigger: 'hover focus'
            });
        });
    }

    // Initialize Bootstrap popovers
    initializePopovers() {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }

    // Initialize modals
    initializeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('shown.bs.modal', function() {
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) firstInput.focus();
            });
        });
    }

    // Enhanced form validation
    setupFormValidation() {
        const forms = document.querySelectorAll('.needs-validation');
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();

                    // Focus on first invalid field
                    const firstInvalid = form.querySelector(':invalid');
                    if (firstInvalid) {
                        firstInvalid.focus();
                        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                form.classList.add('was-validated');
            }, false);

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (input.checkValidity()) {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    } else {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }
                });
            });
        });
    }

    // Initialize scroll animations
    initializeAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                observer.observe(el);
            });
        }
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Quick actions with keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openQuickSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (document.querySelector('[href*="create"]')) {
                            window.location.href = document.querySelector('[href*="create"]').href;
                        }
                        break;
                    case 'm':
                        e.preventDefault();
                        if (document.querySelector('[href*="map"]')) {
                            window.location.href = document.querySelector('[href*="map"]').href;
                        }
                        break;
                }
            }

            // ESC key to close modals/notifications
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.show');
                if (activeModal) {
                    bootstrap.Modal.getInstance(activeModal).hide();
                }
            }
        });
    }

    // Start real-time updates
    startRealTimeUpdates() {
        if (this.appwriteClient && window.location.pathname.includes('dashboard')) {
            this.subscribeToRequests();
            this.subscribeToNotifications();
        }

        // Fallback polling for browsers without WebSocket support
        this.startPollingUpdates();
    }

    // Subscribe to real-time request updates
    subscribeToRequests() {
        try {
            const unsubscribe = this.appwriteClient.subscribe(
                'databases.reliefbridge_db.collections.help_requests.documents',
                response => {
                    console.log('Real-time update:', response);
                    this.handleRequestUpdate(response);
                }
            );
            this.realTimeSubscriptions.push(unsubscribe);
        } catch (error) {
            console.warn('Real-time subscription failed:', error);
        }
    }

    // Subscribe to notifications
    subscribeToNotifications() {
        try {
            const unsubscribe = this.appwriteClient.subscribe(
                'databases.reliefbridge_db.collections.notifications.documents',
                response => {
                    this.handleNotificationUpdate(response);
                }
            );
            this.realTimeSubscriptions.push(unsubscribe);
        } catch (error) {
            console.warn('Notification subscription failed:', error);
        }
    }

    // Handle request updates
    handleRequestUpdate(response) {
        const event = response.events[0];
        const data = response.payload;

        if (event.includes('create')) {
            this.handleNewRequest(data);
        } else if (event.includes('update')) {
            this.handleRequestStatusChange(data);
        }

        // Update UI elements
        this.updateDashboardCounts();
        this.updateRequestsList(data);
    }

    // Handle new request
    handleNewRequest(data) {
        const userRole = this.getUserRole();

        if (userRole === 'volunteer' && data.status === 'pending') {
            const priority = data.priority === 'high' ? 'URGENT: ' : '';
            this.showNotification(
                `${priority}New Help Request`,
                `${data.user_name} needs ${data.request_type} assistance in ${data.location}`,
                null,
                [
                    { action: 'view', title: 'View Details' },
                    { action: 'claim', title: 'Claim Request' }
                ]
            );
        }
    }

    // Handle request status changes
    handleRequestStatusChange(data) {
        const userId = this.getCurrentUserId();

        if (data.user_id === userId) {
            // Notify victim of status changes
            let message = '';
            if (data.status === 'in_progress') {
                message = `${data.volunteer_name} has claimed your ${data.request_type} request and is on the way!`;
            } else if (data.status === 'completed') {
                message = `Your ${data.request_type} request has been completed. Thank you for using ReliefBridge!`;
            }

            if (message) {
                this.showNotification('Request Update', message);
            }
        }
    }

    // Polling fallback for real-time updates
    startPollingUpdates() {
        setInterval(() => {
            this.fetchLatestUpdates();
        }, 30000); // 30 seconds
    }

    // Fetch latest updates via API
    async fetchLatestUpdates() {
        try {
            const response = await fetch('/api/requests/live');
            const data = await response.json();

            if (data.success) {
                this.updateDashboardCounts();
                // Update UI with new data if needed
            }
        } catch (error) {
            console.warn('Failed to fetch updates:', error);
        }
    }

    // Update dashboard statistics
    updateDashboardCounts() {
        const countElements = {
            'totalRequests': document.getElementById('totalRequests'),
            'pendingRequests': document.getElementById('pendingRequests'),
            'assignedRequests': document.getElementById('assignedRequests'),
            'completedRequests': document.getElementById('completedRequests')
        };

        // Animate count changes
        Object.entries(countElements).forEach(([key, element]) => {
            if (element) {
                element.classList.add('animate-pulse');
                setTimeout(() => element.classList.remove('animate-pulse'), 1000);
            }
        });
    }

    // Auto-save functionality
    setupAutoSave() {
        const forms = document.querySelectorAll('form[data-autosave]');
        forms.forEach(form => {
            const formId = form.id || form.action.split('/').pop();

            // Load saved data
            this.loadFormData(form, formId);

            // Save on input
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.saveFormData(form, formId);
                });
            });

            // Clear on submit
            form.addEventListener('submit', () => {
                this.clearFormData(formId);
            });
        });
    }

    // Save form data to localStorage
    saveFormData(form, formId) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(`reliefbridge_autosave_${formId}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save form data:', error);
        }
    }

    // Load form data from localStorage
    loadFormData(form, formId) {
        try {
            const savedData = localStorage.getItem(`reliefbridge_autosave_${formId}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.entries(data).forEach(([key, value]) => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field && value) {
                        field.value = value;
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load form data:', error);
        }
    }

    // Clear saved form data
    clearFormData(formId) {
        localStorage.removeItem(`reliefbridge_autosave_${formId}`);
    }

    // Initialize service worker for offline support
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    // Utility functions
    getUserRole() {
        return document.querySelector('.user-role')?.textContent?.toLowerCase() || 'guest';
    }

    getCurrentUserId() {
        return window.currentUserId || document.querySelector('[data-user-id]')?.dataset?.userId;
    }

    // Enhanced geolocation with accuracy and timeout
    async getCurrentLocation(options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };

        const finalOptions = { ...defaultOptions, ...options };

        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, finalOptions);
        });
    }

    // Calculate distance between two coordinates
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Format date and time
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            relative: this.getRelativeTime(date)
        };
    }

    // Get relative time (e.g., "2 minutes ago")
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    }

    // Quick search functionality
    openQuickSearch() {
        // This would open a search modal or focus search input
        const searchInput = document.querySelector('[type="search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Clean up resources
    destroy() {
        // Unsubscribe from real-time updates
        this.realTimeSubscriptions.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });

        console.log('ReliefBridge cleaned up');
    }
}

// Initialize ReliefBridge when DOM is loaded
let reliefBridgeApp;

document.addEventListener('DOMContentLoaded', function() {
    reliefBridgeApp = new ReliefBridge();
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (reliefBridgeApp) {
        reliefBridgeApp.destroy();
    }
});

// Global utility functions for templates
window.ReliefBridge = {
    showNotification: (title, body, icon) => {
        if (reliefBridgeApp) {
            reliefBridgeApp.showNotification(title, body, icon);
        }
    },

    getCurrentLocation: (options) => {
        if (reliefBridgeApp) {
            return reliefBridgeApp.getCurrentLocation(options);
        }
        return Promise.reject('ReliefBridge not initialized');
    },

    calculateDistance: (lat1, lon1, lat2, lon2) => {
        if (reliefBridgeApp) {
            return reliefBridgeApp.calculateDistance(lat1, lon1, lat2, lon2);
        }
        return 0;
    },

    formatDateTime: (dateString) => {
        if (reliefBridgeApp) {
            return reliefBridgeApp.formatDateTime(dateString);
        }
        return { date: '', time: '', relative: '' };
    }
};

// Enhanced location functionality for templates
function getLocation() {
    const button = event.target;
    const originalText = button.innerHTML;

    button.innerHTML = '<i class="bi bi-spinner spinner-border spinner-border-sm me-2"></i>Getting Location...';
    button.disabled = true;

    window.ReliefBridge.getCurrentLocation()
        .then(position => {
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;

            button.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Location Obtained';
            button.classList.remove('btn-info');
            button.classList.add('btn-success');

            // Show accuracy info
            if (position.coords.accuracy) {
                const accuracy = Math.round(position.coords.accuracy);
                button.title = `Accuracy: ±${accuracy} meters`;
            }
        })
        .catch(error => {
            console.error('Geolocation error:', error);

            let message = 'Unable to get location: ';
            switch(error.code) {
                case 1: message += 'Permission denied'; break;
                case 2: message += 'Position unavailable'; break;
                case 3: message += 'Timeout'; break;
                default: message += error.message; break;
            }

            alert(message);
            button.innerHTML = originalText;
            button.disabled = false;
        });
}

console.log('ReliefBridge Professional JavaScript loaded');