// static/js/map_picker.js - Interactive Map Location Picker (WITH VALIDATION)

let map;
let marker;
let locationSelected = false;

document.addEventListener('DOMContentLoaded', function() {
    initMap();
});

function initMap() {
    // Default center - India
    const defaultCenter = [22.5726, 88.3639]; // Kolkata, India
    
    // Create map
    map = L.map('locationMap').setView(defaultCenter, 6);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Click event on map
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        // ✅ VALIDATE COORDINATES
        if (validateCoordinates(lat, lng)) {
            setLocation(lat, lng);
        } else {
            alert('⚠️ Invalid coordinates! Please select a location within valid range.\nLatitude: -90 to 90\nLongitude: -180 to 180');
        }
    });
    
    // Show instruction
    showMapInstruction();
}

// ✅ NEW: Validate coordinates
function validateCoordinates(lat, lng) {
    // Check if coordinates are valid
    if (isNaN(lat) || isNaN(lng)) {
        console.error('Coordinates are not numbers:', lat, lng);
        return false;
    }
    
    // Latitude must be between -90 and 90
    if (lat < -90 || lat > 90) {
        console.error('Invalid latitude:', lat);
        return false;
    }
    
    // Longitude must be between -180 and 180
    if (lng < -180 || lng > 180) {
        console.error('Invalid longitude:', lng);
        return false;
    }
    
    return true;
}

function setLocation(lat, lng) {
    // ✅ ROUND TO 6 DECIMAL PLACES (prevents floating point issues)
    lat = parseFloat(lat.toFixed(6));
    lng = parseFloat(lng.toFixed(6));
    
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
    
    // Update hidden form fields
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Get address
    reverseGeocode(lat, lng);
    
    // Handle marker drag
    marker.on('dragend', function(e) {
        const newPos = e.target.getLatLng();
        if (validateCoordinates(newPos.lat, newPos.lng)) {
            setLocation(newPos.lat, newPos.lng);
        } else {
            alert('⚠️ Invalid location! Marker moved back.');
            marker.setLatLng([lat, lng]);
        }
    });
    
    // Enable submit button
    locationSelected = true;
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        const statusText = submitBtn.nextElementSibling;
        if (statusText) {
            statusText.textContent = '✅ Location selected! You can now submit.';
            statusText.className = 'text-success text-center mt-2';
        }
    }
    
    // Center map on marker
    map.setView([lat, lng], 15);
    
    // Show coordinates in popup
    marker.bindPopup(`<strong>Selected Location</strong><br>Lat: ${lat}<br>Lng: ${lng}`).openPopup();
}

function getMyLocation() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Getting Location...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // ✅ VALIDATE before setting
                if (validateCoordinates(lat, lng)) {
                    setLocation(lat, lng);
                    btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Location Obtained';
                    btn.classList.remove('btn-info');
                    btn.classList.add('btn-success');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-info');
                        btn.disabled = false;
                    }, 2000);
                } else {
                    alert('⚠️ Your GPS location is invalid! Please select manually on the map.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
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
        alert('Geolocation not supported. Please click on the map.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function searchAddress() {
    const address = prompt('Enter your address or location:');
    
    if (address && address.trim()) {
        // Use Nominatim geocoding
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    
                    // ✅ VALIDATE before setting
                    if (validateCoordinates(lat, lng)) {
                        setLocation(lat, lng);
                    } else {
                        alert('⚠️ Found address has invalid coordinates! Please try another search or select on map.');
                    }
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

function reverseGeocode(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById('location').value = data.display_name;
            } else {
                document.getElementById('location').value = `Lat: ${lat}, Lng: ${lng}`;
            }
        })
        .catch(error => {
            document.getElementById('location').value = `Lat: ${lat}, Lng: ${lng}`;
            console.error('Reverse geocoding error:', error);
        });
}

function showMapInstruction() {
    const popup = L.popup()
        .setLatLng(map.getCenter())
        .setContent('<strong>Click on the map</strong><br>to set your location')
        .openOn(map);
    
    setTimeout(() => {
        map.closePopup();
    }, 3000);
}

// ✅ NEW: Form validation before submit
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('requestForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const lat = parseFloat(document.getElementById('latitude').value);
            const lng = parseFloat(document.getElementById('longitude').value);
            
            if (!locationSelected || !validateCoordinates(lat, lng)) {
                e.preventDefault();
                alert('⚠️ Please select a valid location on the map first!\n\nMake sure:\n- You clicked on the map\n- The red marker is visible\n- Coordinates are valid');
                return false;
            }
            
            return true;
        });
    }
});
