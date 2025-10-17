// static/js/navigation.js - Real-time Navigation to Victim

let map;
let volunteerMarker;
let victimMarker;
let routeLine;
let watchId;
let volunteerPosition = null;

// Initialize map and start tracking
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    // Create map centered on victim location
    map = L.map('navigationMap').setView([victimLat, victimLng], 13);
    
    // Add tile layer (OpenStreetMap)
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
    
    victimMarker.bindPopup(`<strong>${victimName}</strong><br>Victim Location<br><a href="tel:${victimPhone}">Call Now</a>`).openPopup();
    
    // Start tracking volunteer location
    startTracking();
}

function startTracking() {
    if (navigator.geolocation) {
        // Watch position for real-time updates
        watchId = navigator.geolocation.watchPosition(
            updateVolunteerPosition,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
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
        
        volunteerMarker.bindPopup('<strong>Your Location</strong><br>Volunteer Position');
    }
    
    // Draw route line
    drawRoute(lat, lng, victimLat, victimLng);
    
    // Calculate distance and ETA
    updateStats(lat, lng, victimLat, victimLng);
    
    // Adjust map to show both markers
    const bounds = L.latLngBounds([
        [lat, lng],
        [victimLat, victimLng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });
}

function drawRoute(fromLat, fromLng, toLat, toLng) {
    // Remove existing route line
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    
    // Draw simple straight line route
    routeLine = L.polyline([
        [fromLat, fromLng],
        [toLat, toLng]
    ], {
        color: '#0d6efd',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
}

function updateStats(fromLat, fromLng, toLat, toLng) {
    // Calculate distance using Haversine formula
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    
    // Estimate ETA (assuming 40 km/h average speed)
    const averageSpeed = 40; // km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    // Update UI
    document.getElementById('distance').textContent = distance.toFixed(2) + ' km';
    document.getElementById('eta').textContent = timeInMinutes + ' min';
    
    // Update progress bar (closer = more progress)
    const maxDistance = 10; // km - adjust based on your use case
    const progress = Math.max(0, Math.min(100, ((maxDistance - distance) / maxDistance) * 100));
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update status message
    const statusElement = document.getElementById('status');
    if (distance < 0.1) {
        statusElement.innerHTML = '<strong class="text-success">✅ You have arrived!</strong>';
    } else if (distance < 0.5) {
        statusElement.innerHTML = '<strong class="text-warning">📍 Very close - less than 500m</strong>';
    } else {
        statusElement.innerHTML = `<strong>🚗 On the way - ${distance.toFixed(2)} km remaining</strong>`;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of Earth in km
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
    let errorMsg = 'Unable to get your location. ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMsg += 'Please enable location permissions.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
        default:
            errorMsg += 'Unknown error occurred.';
    }
    
    alert(errorMsg);
}

function markAsArrived() {
    if (volunteerPosition) {
        const distance = calculateDistance(
            volunteerPosition.lat,
            volunteerPosition.lng,
            victimLat,
            victimLng
        );
        
        if (distance < 0.5) { // Within 500m
            alert('✅ Marked as arrived! You can now complete the task.');
        } else {
            alert('⚠️ You are still ' + distance.toFixed(2) + ' km away from the victim.');
        }
    } else {
        alert('⚠️ Unable to determine your location. Please wait...');
    }
}

function openInGoogleMaps() {
    // Open Google Maps with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${victimLat},${victimLng}`;
    window.open(mapsUrl, '_blank');
}

// Stop tracking when leaving page
window.addEventListener('beforeunload', function() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});
