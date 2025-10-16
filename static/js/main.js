// Initialize Appwrite Client
const appwriteClient = new Appwrite.Client()
    .setEndpoint(window.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(window.APPWRITE_PROJECT_ID || 'your_project_id');

// Real-time subscription for live updates
function subscribeToRealtimeUpdates(databaseId, collectionId) {
    const unsubscribe = appwriteClient.subscribe(
        `databases.${databaseId}.collections.${collectionId}.documents`,
        response => {
            console.log('Real-time update received:', response);

            // Show notification
            showNotification('New Update', 'A request has been updated');

            // Reload page or update UI dynamically
            updateUI(response.payload);
        }
    );

    return unsubscribe;
}

// Show browser notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/static/images/logo.png'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: body });
            }
        });
    }
}

// Update UI with new data
function updateUI(data) {
    // Add your custom UI update logic here
    console.log('Updating UI with:', data);

    // Example: Update request counts
    updateRequestCounts();

    // Example: Refresh map markers
    if (typeof refreshMapMarkers === 'function') {
        refreshMapMarkers();
    }
}

// Update request counts on dashboard
function updateRequestCounts() {
    fetch('/api/requests/live')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update counts in UI
                const pendingCount = data.data.filter(r => r.status === 'pending').length;
                const inProgressCount = data.data.filter(r => r.status === 'in_progress').length;
                const completedCount = data.data.filter(r => r.status === 'completed').length;

                // Update DOM elements if they exist
                const pendingEl = document.getElementById('pending-count');
                const progressEl = document.getElementById('progress-count');
                const completedEl = document.getElementById('completed-count');

                if (pendingEl) pendingEl.textContent = pendingCount;
                if (progressEl) progressEl.textContent = inProgressCount;
                if (completedEl) completedEl.textContent = completedCount;
            }
        })
        .catch(error => console.error('Error fetching request counts:', error));
}

// Initialize tooltips and popovers
document.addEventListener('DOMContentLoaded', function() {
    // Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    // Initialize real-time updates if on dashboard
    if (window.location.pathname.includes('dashboard')) {
        initializeRealtimeUpdates();
    }

    // Auto-save form data
    initializeAutoSave();
});

// Initialize real-time updates for dashboard pages
function initializeRealtimeUpdates() {
    if (typeof appwriteClient !== 'undefined') {
        subscribeToRealtimeUpdates('reliefbridge_db', 'help_requests');
    }
}

// Auto-save form data to localStorage
function initializeAutoSave() {
    const forms = document.querySelectorAll('form[data-autosave]');
    forms.forEach(form => {
        const formId = form.id || form.action;

        // Load saved data
        const savedData = localStorage.getItem(`autosave_${formId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) field.value = data[key];
                });
            } catch (e) {
                console.warn('Error loading autosaved data:', e);
            }
        }

        // Save data on input
        form.addEventListener('input', () => {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            localStorage.setItem(`autosave_${formId}`, JSON.stringify(data));
        });

        // Clear data on successful submit
        form.addEventListener('submit', () => {
            localStorage.removeItem(`autosave_${formId}`);
        });
    });
}

// Auto-refresh dashboard data every 30 seconds
function autoRefreshDashboard() {
    setInterval(() => {
        updateRequestCounts();
    }, 30000); // 30 seconds
}

// Enhanced geolocation with accuracy
function getCurrentLocationAccurate() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Utility function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

// Start auto-refresh if on dashboard
if (window.location.pathname.includes('dashboard')) {
    autoRefreshDashboard();
}

// Export functions for global use
window.ReliefBridge = {
    showNotification,
    updateUI,
    getCurrentLocationAccurate,
    calculateDistance,
    formatDate
};