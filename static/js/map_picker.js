// static/js/map_picker.js - Interactive Map Location Picker

let map;
let marker;
let locationSelected = false;

// Initialize map on page load
document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

// Initialize the map
function initMap() {
    // Default center (you can change this to your city)
    const defaultCenter = [37.7749, -122.4194]; // San Francisco
    
    // Create map
    map = L.map('locationMap').setView(defaultCenter, 13);
    
    // Add tile layer (map background)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Click event on map
    map.on('click', function(e) {
        setLocation(e.latlng.lat, e.latlng.lng);
    });
    
    // Show info message
    showMapInstruction();
}

// Set location on map
function setLocation(lat, lng) {
    // Remove existing marker
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Add new marker
    marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);
    
    // Update coordinates
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
    
    // Enable drag on marker
    marker.on('dragend', function(e) {
        const newPos = e.target.getLatLng();
        setLocation(newPos.lat, newPos.lng);
    });
    
    // Enable submit button
    locationSelected = true;
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').nextElementSibling.textContent = 'Location selected! You can now submit.';
    
    // Center map on marker
    map.setView([lat, lng], 15);
}

// Get user's current location
function getMyLocation() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Getting Location...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                setLocation(position.coords.latitude, position.coords.longitude);
                btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Location Obtained';
                btn.classList.remove('btn-info');
                btn.classList.add('btn-success');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-info');
                    btn.disabled = false;
                }, 2000);
            },
            function(error) {
                alert('Error getting location: ' + error.message + '\nPlease click on the map to set your location manually.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolocation is not supported by your browser. Please click on the map to set your location.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Search for an address
function searchAddress() {
    const address = prompt('Enter your address or location:');
    
    if (address) {
        // Use Nominatim geocoding service
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const result = data[0];
                    setLocation(parseFloat(result.lat), parseFloat(result.lon));
                } else {
                    alert('Address not found. Please try again or click on the map.');
                }
            })
            .catch(error => {
                alert('Error searching address. Please click on the map instead.');
                console.error(error);
            });
    }
}

// Reverse geocode coordinates to address
function reverseGeocode(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById('location').value = data.display_name;
            } else {
                document.getElementById('location').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
        })
        .catch(error => {
            document.getElementById('location').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            console.error('Reverse geocoding error:', error);
        });
}

// Show instruction popup
function showMapInstruction() {
    const popup = L.popup()
        .setLatLng(map.getCenter())
        .setContent('<strong>Click on the map</strong><br>to set your location')
        .openOn(map);
    
    setTimeout(() => {
        map.closePopup();
    }, 3000);
}

// Form validation
document.getElementById('requestForm').addEventListener('submit', function(e) {
    if (!locationSelected) {
        e.preventDefault();
        alert('Please select your location on the map first!');
        return false;
    }
});
