// Global variables
let map;
let heatmapLayer = null;
let areaMarkers = [];
let hospitalMarkers = [];
let currentScenario = {
    rainfall: 1.0,
    drainage: 1.0,
    isNight: false,
    autoUpdate: true
};
let updateInterval = null;
let currentCity = 'New York';
let selectedArea = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏙️ Starting City Flood Risk Map...');
    initMap();
    initControls();
    initEventListeners();
    updateMapData();
});

// Initialize map
function initMap() {
    console.log('🗺️ Creating map...');
    
    map = L.map('map', {
        center: [40.7128, -74.0060],
        zoom: 12,
        zoomControl: false,
        maxZoom: 18,
        minZoom: 3
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add zoom control
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // Add scale
    L.control.scale({
        imperial: true,
        metric: true
    }).addTo(map);
    
    console.log('✅ Map created');
}

// Initialize controls
function initControls() {
    console.log('⚙️ Setting up controls...');
    
    // Set initial display values
    updateSliderDisplay('rainfall', 1.0);
    updateSliderDisplay('drainage', 1.0);
    
    // Set current city in dropdown
    document.getElementById('city-select').value = currentCity;
    
    console.log('✅ Controls ready');
}

// Initialize event listeners
function initEventListeners() {
    // Rainfall slider
    document.getElementById('rainfall-slider').addEventListener('input', function(e) {
        currentScenario.rainfall = parseFloat(e.target.value);
        updateSliderDisplay('rainfall', currentScenario.rainfall);
    });
    
    // Drainage slider
    document.getElementById('drainage-slider').addEventListener('input', function(e) {
        currentScenario.drainage = parseFloat(e.target.value);
        updateSliderDisplay('drainage', currentScenario.drainage);
    });
    
    // Night toggle
    document.getElementById('night-toggle').addEventListener('change', function(e) {
        currentScenario.isNight = e.target.checked;
        console.log('🌙 Night mode:', currentScenario.isNight);
    });
    
    // Real-time toggle
    document.getElementById('real-time-toggle').addEventListener('change', function(e) {
        currentScenario.autoUpdate = e.target.checked;
        if (currentScenario.autoUpdate) {
            startAutoUpdate();
        } else {
            stopAutoUpdate();
        }
    });
    
    // Apply button
    document.getElementById('apply-scenario').addEventListener('click', function() {
        console.log('🔄 Updating map data...');
        updateMapData();
        
        // Show loading animation
        const btn = this;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Update Map';
        }, 1000);
    });
    
    // City select
    document.getElementById('city-select').addEventListener('change', function(e) {
        currentCity = e.target.value;
        console.log('🏙️ Switching to city:', currentCity);
        flyToCity(currentCity);
        
        // Update map after flying
        setTimeout(() => {
            updateMapData();
        }, 1500);
    });
    
    // Fly to city button
    document.getElementById('fly-to-city').addEventListener('click', function() {
        flyToCity(currentCity);
    });
    
    // Map controls
    document.getElementById('zoom-in').addEventListener('click', function() {
        map.zoomIn();
    });
    
    document.getElementById('zoom-out').addEventListener('click', function() {
        map.zoomOut();
    });
    
    // Start auto-update
    startAutoUpdate();
}

// Update slider display
function updateSliderDisplay(type, value) {
    let displayValue, label;
    
    switch(type) {
        case 'rainfall':
            if (value < 0.8) label = 'Light';
            else if (value < 1.3) label = 'Normal';
            else if (value < 2.0) label = 'Heavy';
            else label = 'Extreme';
            displayValue = `${label} (${value.toFixed(1)}x)`;
            document.getElementById('rainfall-value').textContent = displayValue;
            break;
            
        case 'drainage':
            if (value < 0.9) label = 'Excellent';
            else if (value < 1.1) label = 'Normal';
            else if (value < 1.5) label = 'Poor';
            else label = 'Very Poor';
            displayValue = `${label} (${value.toFixed(1)}x)`;
            document.getElementById('drainage-value').textContent = displayValue;
            break;
    }
}

// Fly to city
function flyToCity(city) {
    const cities = {
        'New York': [40.7128, -74.0060, 12],
        'Mumbai': [19.0760, 72.8777, 12],
        'Tokyo': [35.6762, 139.6503, 12],
        'London': [51.5074, -0.1278, 12],
        'Shanghai': [31.2304, 121.4737, 12],
        'Miami': [25.7617, -80.1918, 12]
    };
    
    if (cities[city]) {
        map.flyTo([cities[city][0], cities[city][1]], cities[city][2], {
            duration: 1.5,
            easeLinearity: 0.25
        });
        
        // Update city display
        document.getElementById('current-city-display').textContent = city;
    }
}

// Start auto-update
function startAutoUpdate() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        if (currentScenario.autoUpdate) {
            updateMapData();
        }
    }, 15000); // Update every 15 seconds
    
    document.getElementById('update-interval').textContent = '15s';
}

// Stop auto-update
function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    document.getElementById('update-interval').textContent = 'Off';
}

// Update map data
async function updateMapData() {
    try {
        console.log('📡 Fetching data for:', currentCity);
        
        // Build URL
        const url = `http://localhost:5000/api/real-time/map-data?rainfall=${currentScenario.rainfall}&drainage=${currentScenario.drainage}&night=${currentScenario.isNight}&city=${encodeURIComponent(currentCity)}`;
        
        console.log('🌐 Calling:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Data received for', currentCity);
        console.log('📊 Statistics:', data.statistics);
        
        renderMapData(data);
        updateStatistics(data);
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('❌ Error fetching data:', error);
        showError(`Failed to load ${currentCity} data: ${error.message}`);
    }
}

// Render map data
function renderMapData(data) {
    console.log('🎨 Rendering map data...');
    
    // Clear previous layers
    clearMapLayers();
    
    const { areas, hospitals } = data;
    
    // Create heatmap data
    const heatmapData = areas.map(area => {
        const score = area.risk_assessment.final_score;
        return [area.center[0], area.center[1], score * 25];
    });
    
    // Create heatmap layer
    heatmapLayer = L.heatLayer(heatmapData, {
        radius: 35,
        blur: 25,
        maxZoom: 18,
        minOpacity: 0.6,
        gradient: {
            0.0: '#00ff00',  // Green
            0.3: '#ffff00',  // Yellow
            0.6: '#ff9900',  // Orange
            0.8: '#ff3300',  // Red-orange
            1.0: '#ff0000'   // Red
        }
    }).addTo(map);
    
    // Create area markers with HOVER and CLICK events
    areas.forEach(area => {
        const riskLevel = area.risk_assessment.risk_level.toLowerCase();
        const color = getRiskColor(riskLevel);
        const score = area.risk_assessment.final_score;
        
        // Marker size based on risk
        const radius = 6 + (score * 8);
        
        // Create circle marker
        const marker = L.circleMarker(area.center, {
            radius: radius,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.6,
            className: 'risk-marker'
        });
        
        // Create detailed popup content
        const popupContent = createAreaPopup(area);
        
        // Bind popup
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            minWidth: 250,
            className: 'custom-popup'
        });
        
        // HOVER EFFECTS - show tooltip on hover
        marker.on('mouseover', function(e) {
            this.setStyle({
                weight: 3,
                fillOpacity: 0.9
            });
            
            // Show tooltip with basic info
            const tooltip = L.tooltip({
                direction: 'top',
                permanent: false,
                className: 'area-tooltip'
            })
            .setContent(`
                <div style="font-weight: bold; color: ${color};">
                    ${area.name}
                </div>
                <div style="font-size: 0.9em;">
                    ${area.risk_assessment.risk_level} Risk (${(area.risk_assessment.final_score * 100).toFixed(1)}%)
                </div>
            `)
            .setLatLng(e.latlng);
            
            this._tooltip = tooltip;
            this.bindTooltip(tooltip).openTooltip();
            
            // Update area details panel
            updateAreaDetailsPanel(area);
        });
        
        marker.on('mouseout', function() {
            this.setStyle({
                weight: 1.5,
                fillOpacity: 0.6
            });
            
            // Remove tooltip
            if (this._tooltip) {
                this.unbindTooltip();
                this._tooltip = null;
            }
        });
        
        // CLICK EVENT - show detailed info
        marker.on('click', function(e) {
            // Select this area
            selectedArea = area;
            
            // Update detailed info panel
            showAreaDetails(area);
            
            // Highlight this marker
            highlightMarker(this);
            
            console.log('📍 Selected area:', area.name);
        });
        
        marker.addTo(map);
        areaMarkers.push(marker);
    });
    
    // Create hospital markers
    hospitals.forEach(hospital => {
        const icon = L.divIcon({
            html: `<div style="color: #0066ff; font-size: 24px; text-shadow: 0 0 3px white;">🏥</div>`,
            iconSize: [30, 30],
            className: 'hospital-icon'
        });
        
        const marker = L.marker(hospital.location, { icon });
        
        // Hospital popup
        const popupContent = `
            <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 10px 0; color: #0066ff;">${hospital.name}</h3>
                <div style="margin-bottom: 8px;">
                    <strong>Type:</strong> ${hospital.type}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Total Beds:</strong> ${hospital.beds}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Emergency Beds:</strong> ${hospital.emergency_beds}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Flood Resistant:</strong> ${hospital.flood_resistant ? 'Yes' : 'No'}
                </div>
                ${hospital.phone ? `
                <div>
                    <strong>Phone:</strong> ${hospital.phone}
                </div>
                ` : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(map);
        hospitalMarkers.push(marker);
    });
    
    console.log(`✅ Rendered ${areaMarkers.length} areas and ${hospitalMarkers.length} hospitals`);
}

// Create area popup content
function createAreaPopup(area) {
    const risk = area.risk_assessment;
    const color = getRiskColor(risk.risk_level.toLowerCase());
    
    return `
        <div style="padding: 15px; max-width: 300px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #333;">${area.name}</h3>
                <div style="background: ${color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold;">
                    ${risk.risk_level}
                </div>
            </div>
            
            <div style="margin-bottom: 15px; font-size: 1.2em; text-align: center; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                <strong style="color: ${color}; font-size: 1.4em;">
                    ${(risk.final_score * 100).toFixed(1)}%
                </strong>
                <div style="font-size: 0.9em; color: #666;">Risk Score</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-weight: bold; margin-bottom: 5px; color: #555;">Location Info:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div><strong>City:</strong> ${area.city}</div>
                    <div><strong>Region:</strong> ${area.region || 'N/A'}</div>
                    <div><strong>Land Type:</strong> ${area.land_type || 'N/A'}</div>
                    <div><strong>Elevation:</strong> ${area.elevation || 'N/A'}m</div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-weight: bold; margin-bottom: 5px; color: #555;">Population & Infrastructure:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.9em;">
                    <div><strong>Population Density:</strong> ${area.population_density?.toLocaleString() || 'N/A'}/km²</div>
                    <div><strong>River Distance:</strong> ${area.river_distance || 'N/A'}km</div>
                    <div><strong>Coastal:</strong> ${area.coastal ? 'Yes' : 'No'}</div>
                    <div><strong>Drainage Score:</strong> ${area.drainage_score || 'N/A'}/1.0</div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; margin-bottom: 5px; color: #555;">Historical Data:</div>
                <div style="font-size: 0.9em;">
                    <strong>Past Floods:</strong> ${area.historical_floods || 0} incidents
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: 0.8em; color: #888;">
                Click for detailed analysis
            </div>
        </div>
    `;
}

// Update area details panel on hover
function updateAreaDetailsPanel(area) {
    const panel = document.getElementById('area-details-panel');
    if (!panel) return;
    
    const risk = area.risk_assessment;
    const color = getRiskColor(risk.risk_level.toLowerCase());
    
    panel.innerHTML = `
        <div style="padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0;">${area.name}</h4>
                <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">
                    ${risk.risk_level}
                </span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Risk Score:</strong> ${(risk.final_score * 100).toFixed(1)}%
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.9em;">
                <div><strong>Elevation:</strong> ${area.elevation}m</div>
                <div><strong>Population:</strong> ${area.population_density?.toLocaleString() || 'N/A'}</div>
                <div><strong>Land Type:</strong> ${area.land_type}</div>
                <div><strong>Drainage:</strong> ${area.drainage_score}/1.0</div>
            </div>
            
            <div style="margin-top: 10px; font-size: 0.8em; color: #666;">
                Hovering over ${area.name}
            </div>
        </div>
    `;
    
    panel.style.display = 'block';
}

// Show detailed area info on click
function showAreaDetails(area) {
    const detailsContainer = document.getElementById('area-details');
    if (!detailsContainer) return;
    
    const risk = area.risk_assessment;
    const color = getRiskColor(risk.risk_level.toLowerCase());
    
    detailsContainer.innerHTML = `
        <div class="area-detail-card">
            <div class="area-detail-header">
                <h3>${area.name}</h3>
                <div class="risk-badge" style="background: ${color};">
                    ${risk.risk_level} Risk (${(risk.final_score * 100).toFixed(1)}%)
                </div>
            </div>
            
            <div class="area-detail-section">
                <h4><i class="fas fa-map-marker-alt"></i> Location Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">City:</span>
                        <span class="detail-value">${area.city}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Region:</span>
                        <span class="detail-value">${area.region || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Land Type:</span>
                        <span class="detail-value">${area.land_type || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Coastal:</span>
                        <span class="detail-value">${area.coastal ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
            
            <div class="area-detail-section">
                <h4><i class="fas fa-chart-line"></i> Risk Factors</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Elevation:</span>
                        <span class="detail-value">${area.elevation}m</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">River Distance:</span>
                        <span class="detail-value">${area.river_distance}km</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Drainage Score:</span>
                        <span class="detail-value">${area.drainage_score}/1.0</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Past Floods:</span>
                        <span class="detail-value">${area.historical_floods}</span>
                    </div>
                </div>
            </div>
            
            <div class="area-detail-section">
                <h4><i class="fas fa-users"></i> Population</h4>
                <div class="detail-item-full">
                    <span class="detail-label">Population Density:</span>
                    <span class="detail-value">${area.population_density?.toLocaleString() || 'N/A'} people/km²</span>
                </div>
            </div>
            
            ${risk.components ? `
            <div class="area-detail-section">
                <h4><i class="fas fa-puzzle-piece"></i> Risk Components</h4>
                <div class="components-grid">
                    ${Object.entries(risk.components).map(([key, value]) => `
                        <div class="component-item">
                            <span class="component-label">${formatComponentName(key)}:</span>
                            <div class="component-bar">
                                <div class="component-fill" style="width: ${value * 100}%; background: ${color};"></div>
                            </div>
                            <span class="component-value">${(value * 100).toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="area-detail-footer">
                <button class="action-btn" onclick="zoomToArea(${area.center[0]}, ${area.center[1]})">
                    <i class="fas fa-search-location"></i> Zoom to Area
                </button>
                <button class="action-btn" onclick="showEmergencyInfo('${area.id}')">
                    <i class="fas fa-ambulance"></i> Emergency Info
                </button>
            </div>
        </div>
    `;
    
    // Scroll to details
    detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Format component names
function formatComponentName(key) {
    const names = {
        'elevation': 'Low Elevation',
        'river_proximity': 'River Proximity',
        'coastal': 'Coastal Area',
        'population': 'Population Density',
        'drainage': 'Poor Drainage',
        'history': 'Flood History'
    };
    return names[key] || key.replace('_', ' ').toUpperCase();
}

// Highlight a marker
function highlightMarker(marker) {
    // Reset all markers
    areaMarkers.forEach(m => {
        m.setStyle({
            weight: 1.5,
            fillOpacity: 0.6
        });
    });
    
    // Highlight selected marker
    marker.setStyle({
        weight: 4,
        fillOpacity: 0.9,
        color: '#ffff00'
    });
    
    // Bring to front
    marker.bringToFront();
}

// Clear map layers
function clearMapLayers() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
    
    areaMarkers.forEach(marker => map.removeLayer(marker));
    areaMarkers = [];
    
    hospitalMarkers.forEach(marker => map.removeLayer(marker));
    hospitalMarkers = [];
}

// Update statistics
function updateStatistics(data) {
    const stats = data.statistics;
    
    if (stats) {
        document.getElementById('area-count').textContent = stats.total_areas;
        document.getElementById('high-risk-count').textContent = stats.high_risk;
        document.getElementById('medium-risk-count').textContent = stats.medium_risk;
        document.getElementById('low-risk-count').textContent = stats.low_risk;
        document.getElementById('avg-risk').textContent = `${(stats.avg_risk_score * 100).toFixed(1)}%`;
        
        // Update percentages
        const total = stats.total_areas || 1;
        document.getElementById('high-risk-percent').textContent = `${((stats.high_risk / total) * 100).toFixed(1)}%`;
        document.getElementById('medium-risk-percent').textContent = `${((stats.medium_risk / total) * 100).toFixed(1)}%`;
        document.getElementById('low-risk-percent').textContent = `${((stats.low_risk / total) * 100).toFixed(1)}%`;
        
        console.log('📊 Updated statistics:', stats);
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update').textContent = `Updated: ${timeString}`;
}

// Get color for risk level
function getRiskColor(riskLevel) {
    switch(riskLevel) {
        case 'high': return '#ff0000';     // Red
        case 'medium': return '#ff9900';   // Orange
        case 'low': return '#00cc00';      // Green
        default: return '#999999';
    }
}

// Show error message
function showError(msg) {
    console.error('💥 Error:', msg);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">⚠️</div>
            <div>
                <strong style="display: block; margin-bottom: 5px;">Error</strong>
                <div style="font-size: 14px;">${msg}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Utility functions
function zoomToArea(lat, lng) {
    map.flyTo([lat, lng], 15, {
        duration: 1,
        easeLinearity: 0.25
    });
}

function showEmergencyInfo(areaId) {
    alert(`Emergency information for area ${areaId} would be displayed here.\n\nThis would include:\n• Nearest hospitals\n• Evacuation routes\n• Emergency shelters\n• Contact numbers`);
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .risk-marker {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .risk-marker:hover {
        filter: brightness(1.2);
        z-index: 1000 !important;
    }
    
    .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 10px;
        padding: 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .area-tooltip {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .area-detail-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        margin-bottom: 20px;
    }
    
    .area-detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
    }
    
    .area-detail-header h3 {
        margin: 0;
        color: #2c3e50;
    }
    
    .risk-badge {
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9em;
    }
    
    .area-detail-section {
        margin-bottom: 20px;
    }
    
    .area-detail-section h4 {
        color: #3498db;
        margin: 0 0 15px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .detail-item-full {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
    }
    
    .detail-label {
        color: #666;
        font-weight: 500;
    }
    
    .detail-value {
        color: #2c3e50;
        font-weight: 600;
    }
    
    .components-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .component-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .component-label {
        width: 140px;
        color: #666;
        font-size: 0.9em;
    }
    
    .component-bar {
        flex: 1;
        height: 8px;
        background: #eee;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .component-fill {
        height: 100%;
        border-radius: 4px;
    }
    
    .component-value {
        width: 50px;
        text-align: right;
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9em;
    }
    
    .area-detail-footer {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
    
    .action-btn {
        flex: 1;
        padding: 10px 15px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: background 0.3s ease;
    }
    
    .action-btn:hover {
        background: #2980b9;
    }
    
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 400px;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    #area-details-panel {
        background: white;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-left: 4px solid #3498db;
        display: none;
    }
`;
document.head.appendChild(style);