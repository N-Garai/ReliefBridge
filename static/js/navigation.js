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
    // Create map centered between volunteer and victim (will update)
    map = L.map('navigationMap').setView([victimLat, victimLng], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add victim marker (red)
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
    
    victimMarker.bindPopup(`<strong>${victimName}</strong><br>Victim Location<br><a href="tel:${victimPhone}">Call Now</a>`);
    
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
    
    // Update or create volunteer marker (blue)
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
    
    // Draw route
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
    
    // Get routing from OpenRouteService or use simple line
    // For simplicity, drawing a straight line (you can add turn-by-turn routing API)
    routeLine = L.polyline([
        [fromLat, fromLng],
        [toLat, toLng]
    ], {
        color: '#0d6efd',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Get actual turn-by-turn directions (optional - using OSRM)
    getDirections(fromLat, fromLng, toLat, toLng);
}

function getDirections(fromLat, fromLng, toLat, toLng) {
    // Using OSRM (Open Source Routing Machine) for free routing
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&steps=true`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                
                // Draw actual route
                const routeCoords = polyline.decode(route.geometry);
                if (routeLine) map.removeLayer(routeLine);
                
                routeLine = L.polyline(routeCoords, {
                    color: '#0d6efd',
                    weight: 5,
                    opacity: 0.8
                }).addTo(map);
                
                // Show turn-by-turn directions
                displayDirections(route.legs[0].steps);
            }
        })
        .catch(error => {
            console.log('Routing error:', error);
            // Fallback to straight line already drawn
        });
}

function displayDirections(steps) {
    const directionsDiv = document.getElementById('directions');
    let html = '<ol class="list-group list-group-flush">';
    
    steps.forEach((step, index) => {
        const distance = (step.distance / 1000).toFixed(2); // km
        const instruction = step.maneuver.instruction || 'Continue';
        
        html += `
            <li class="list-group-item d-flex align-items-center">
                <span class="badge bg-primary rounded-circle me-3">${index + 1}</span>
                <div>
                    <strong>${instruction}</strong><br>
                    <small class="text-muted">${distance} km</small>
                </div>
            </li>
        `;
    });
    
    html += '</ol>';
    directionsDiv.innerHTML = html;
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
    
    // Update status
    if (distance < 0.1) {
        document.getElementById('status').textContent = '✅ You have arrived!';
        document.getElementById('status').className = 'text-success fw-bold';
    } else if (distance < 0.5) {
        document.getElementById('status').textContent = '📍 Very close - less than 500m';
    } else {
        document.getElementById('status').textContent = `🚗 On the way - ${distance.toFixed(2)} km remaining`;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
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
    alert('Unable to get your location. Please enable GPS and refresh.');
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
    }
}

function shareLocation() {
    if (volunteerPosition) {
        const shareUrl = `https://www.google.com/maps?q=${volunteerPosition.lat},${volunteerPosition.lng}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Location',
                text: 'I am here to help you!',
                url: shareUrl
            });
        } else {
            // Copy to clipboard
            navigator.clipboard.writeText(shareUrl);
            alert('Location link copied to clipboard!');
        }
    }
}

// Stop tracking when leaving page
window.addEventListener('beforeunload', function() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});

// Add polyline decoder (needed for OSRM)
const polyline = {
    decode: function(str, precision) {
        let index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision || 5);
        
        while (index < str.length) {
            byte = null; shift = 0; result = 0;
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            
            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            shift = result = 0;
            
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            
            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            
            lat += latitude_change;
            lng += longitude_change;
            
            coordinates.push([lat / factor, lng / factor]);
        }
        
        return coordinates;
    }
};
