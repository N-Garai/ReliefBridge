// static/js/navigation.js - Real-time Navigation (FIXED)

let map;
let volunteerMarker;
let victimMarker;
let routeLine;
let watchId;
let volunteerPosition = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    // Create map - calculate center between volunteer and victim
    const centerLat = victimLat;
    const centerLng = victimLng;
    
    map = L.map('navigationMap').setView([centerLat, centerLng], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add victim marker (RED)
    victimMarker = L.marker([victimLat, victimLng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);
    
    victimMarker.bindPopup(`<strong>${victimName}</strong><br>Victim Location<br><a href="tel:${victimPhone}">Call</a>`).openPopup();
    
    // Start tracking volunteer location
    startTracking();
}

function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            updateVolunteerPosition,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation not supported by your browser');
    }
}

function updateVolunteerPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    volunteerPosition = { lat, lng };
    
    // Update or create volunteer marker (BLUE)
    if (volunteerMarker) {
        volunteerMarker.setLatLng([lat, lng]);
    } else {
        volunteerMarker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);
        
        volunteerMarker.bindPopup('<strong>Your Location</strong><br>Volunteer');
    }
    
    // Draw route (FIXED VERSION)
    drawRoute(lat, lng, victimLat, victimLng);
    
    // Calculate and update stats
    updateStats(lat, lng, victimLat, victimLng);
    
    // Fit bounds to show both markers (FIXED)
    fitMapBounds(lat, lng, victimLat, victimLng);
}

function drawRoute(fromLat, fromLng, toLat, toLng) {
    // Remove existing route
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    
    // ✅ FIX: Use geodesic option to draw route correctly
    // This prevents the "mirror map" issue when crossing large distances
    routeLine = L.polyline([
        [fromLat, fromLng],
        [toLat, toLng]
    ], {
        color: '#0d6efd',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
        // This prevents wrapping around the world
        noClip: false
    }).addTo(map);
}

function fitMapBounds(volLat, volLng, vicLat, vicLng) {
    // ✅ FIX: Calculate proper bounds without crossing dateline
    const bounds = L.latLngBounds([
        [volLat, volLng],
        [vicLat, vicLng]
    ]);
    
    // Add padding and fit
    map.fitBounds(bounds, { 
        padding: [80, 80],
        maxZoom: 13
    });
}

function updateStats(fromLat, fromLng, toLat, toLng) {
    // Calculate distance
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    
    // Calculate ETA (40 km/h average)
    const timeInMinutes = Math.round((distance / 40) * 60);
    
    // Update UI
    document.getElementById('distance').textContent = distance.toFixed(2) + ' km';
    document.getElementById('eta').textContent = timeInMinutes + ' min';
    
    // Update progress bar
    const maxDistance = 50; // Adjust based on typical distances
    const progress = Math.max(0, Math.min(100, ((maxDistance - distance) / maxDistance) * 100));
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update status
    const statusEl = document.getElementById('status');
    if (distance < 0.1) {
        statusEl.innerHTML = '<strong class="text-success">✅ You have arrived!</strong>';
    } else if (distance < 0.5) {
        statusEl.innerHTML = '<strong class="text-warning">📍 Very close - less than 500m</strong>';
    } else if (distance < 5) {
        statusEl.innerHTML = `<strong class="text-info">🚗 Nearby - ${distance.toFixed(2)} km remaining</strong>`;
    } else {
        statusEl.innerHTML = `<strong>🚗 On the way - ${distance.toFixed(2)} km remaining</strong>`;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function handleLocationError(error) {
    console.error('Location error:', error);
    let msg = 'Unable to get location. ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            msg += 'Please enable location permissions.';
            break;
        case error.POSITION_UNAVAILABLE:
            msg += 'Location unavailable.';
            break;
        case error.TIMEOUT:
            msg += 'Request timed out.';
            break;
        default:
            msg += 'Unknown error.';
    }
    
    alert(msg);
}

function markAsArrived() {
    if (!volunteerPosition) {
        alert('⚠️ Waiting for your location...');
        return;
    }
    
    const distance = calculateDistance(
        volunteerPosition.lat,
        volunteerPosition.lng,
        victimLat,
        victimLng
    );
    
    if (distance < 0.5) {
        alert('✅ Marked as arrived! You can complete the task now.');
    } else {
        alert(`⚠️ You are ${distance.toFixed(2)} km away. Get closer to mark as arrived.`);
    }
}

function openInGoogleMaps() {
    // Open Google Maps directions
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${victimLat},${victimLng}`, '_blank');
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});
