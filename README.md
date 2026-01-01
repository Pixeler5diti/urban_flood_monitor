#  **Urban Flood Monitor**

**Real-Time Flood Risk Assessment and Visualization System**

## **Project Overview**
Urban Flood Monitor is a web-based interactive system that simulates and visualizes flood risks in major global cities. The system uses geospatial data and environmental factors to generate real-time flood risk predictions with an intuitive heatmap interface.

##  **Features**

### 🗺️ **Core Features**
- **Interactive World Map** - View flood risks across 6 major cities
- **Real-time Heatmap Visualization** - Color-coded risk levels (Low/Medium/High)
- **Dynamic Risk Simulation** - Adjust rainfall, drainage, and time factors
- **City-Specific Data** - Unique risk profiles for each city
- **Statistical Dashboard** - Live risk distribution statistics

###  **Control Panel**
- Rainfall intensity slider (0.1x to 3.0x)
- Drainage efficiency control (0.1x to 2.0x)
- Nighttime scenario toggle (+30% risk)
- City selection dropdown
- Real-time statistics display

### **Data Points**
- 500+ simulated areas per city
- Risk factors: elevation, population density, drainage quality
- Historical flood data simulation
- Hospital locations and capacities
- Geographic risk components

##  **System Architecture**

### **Backend** (`app.py`)
- Python HTTP server (built-in `http.server`)
- REST API with CORS support
- Dynamic data generation based on parameters
- No external dependencies required

### **Frontend** (`index.html`)
- Leaflet.js for interactive maps
- Heatmap.js for risk visualization
- Vanilla JavaScript for dynamic updates
- Responsive CSS design

##  **Installation & Setup**

### **Prerequisites**
- Python 3.6 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for map tiles)

### **Quick Start**
1. **Clone/Download the project:**
   ```bash
   git clone <repository-url>
   cd urban-flood-monitor
   ```

2. **Run the backend server:**
   ```bash
   python app.py
   ```
   *Output:* `✅ Server running at http://localhost:5000`

3. **Open the frontend:**
   - Double-click `index.html` OR
   - Open in browser: `file:///path/to/urban-flood-monitor/index.html`

4. **Start monitoring:**
   - Select a city from dropdown
   - Adjust risk parameters
   - Click "Update Map"

### **File Structure**
```
urban-flood-monitor/
├── app.py              # Python backend server
├── index.html          # Web interface
├── README.md           # This documentation
└── requirements.txt    # Python requirements (empty - no deps)
```

## 🌍 **Supported Cities**
1. **New York, USA** - Coastal metropolitan
2. **Mumbai, India** - Dense coastal city
3. **Tokyo, Japan** - Earthquake/tsunami prone
4. **London, UK** - River-based flood risks
5. **Shanghai, China** - Coastal megacity
6. **Miami, USA** - Low-lying coastal area

## 📡 **API Endpoints**

### **GET /** - Main data endpoint
**Parameters:**
- `city` - City name (default: "New York")
- `rainfall` - Rainfall multiplier (0.1-3.0)
- `drainage` - Drainage efficiency (0.1-2.0)
- `night` - Nighttime scenario (true/false)

**Example:**
```
http://localhost:5000/?city=Mumbai&rainfall=2.0&drainage=1.2&night=true
```

**Response:**
```json
{
  "areas": [...],       // 500+ flood risk areas
  "hospitals": [...],   // Emergency facilities
  "city": "Mumbai",
  "timestamp": "2024-01-15T10:30:00",
  "status": "success"
}
```

## 🔬 **Risk Calculation Algorithm**

### **Base Risk Factors**
```
Risk = f(Elevation, Population Density, Drainage Quality, 
         Proximity to Water, Historical Floods)
```

### **Scenario Multipliers**
- **Rainfall:** Linear multiplier (0.1x to 3.0x)
- **Drainage:** Inverse relationship (poor drainage = higher risk)
- **Nighttime:** +30% increased risk
- **City-specific:** Unique geographic factors per city

### **Risk Classification**
- **Low Risk:** < 33% (Green)
- **Medium Risk:** 33% - 66% (Orange)
- **High Risk:** > 66% (Red)

## 🎮 **How to Use**

### **Basic Usage**
1. **Select a City** - Choose from dropdown menu
2. **Adjust Parameters** - Use sliders for rainfall and drainage
3. **Toggle Night Mode** - Enable/disable nighttime scenario
4. **Update Map** - Click button to generate new risk assessment
5. **Explore Data** - Click dots for detailed area information

### **Advanced Features**
- **Hover over areas** - See quick risk preview
- **Click dots** - View detailed statistics
- **Zoom/Pan map** - Explore different regions
- **Compare cities** - Switch between cities to compare risks

##  **Interpretation Guide**

### **Heatmap Colors**
- 🟢 **Green:** Low risk areas (safe zones)
- 🟡 **Yellow/Orange:** Medium risk (monitor)
- 🔴 **Red:** High risk (immediate attention needed)

### **Statistics Panel**
- **Total Areas:** Number of monitored zones
- **Risk Distribution:** Percentage breakdown by risk level
- **Last Update:** Data refresh timestamp

## **Testing**

### **Test Scenarios**
1. **Normal Conditions:** rainfall=1.0, drainage=1.0, night=false
2. **Heavy Rainfall:** rainfall=2.5, drainage=1.0, night=false
3. **Poor Drainage:** rainfall=1.0, drainage=1.8, night=false
4. **Night Emergency:** rainfall=1.5, drainage=1.2, night=true

### **City-Specific Testing**
- **Mumbai:** Test with high rainfall (monsoon simulation)
- **Miami:** Test with normal rainfall (inherent low elevation risk)
- **London:** Test river-based flooding scenarios

## 🔧 **Troubleshooting**

### **Common Issues**
1. **"Cannot connect to server"**
   - Ensure `app.py` is running (`python app.py`)
   - Check if port 5000 is available
   - Verify Python version (3.6+)

2. **"Map not loading"**
   - Check internet connection (needs map tiles)
   - Try different browser
   - Clear browser cache

3. **"No data points shown"**
   - Click "Update Map" button
   - Check browser console for errors (F12)
   - Verify API response at `http://localhost:5000/?city=NewYork`

### **Browser Console Commands**
```javascript
// Check if map is loaded
console.log(map);

// Force refresh data
loadData();

// Test API directly
fetch('http://localhost:5000/?city=Mumbai')
  .then(r => r.json())
  .then(console.log);
```

##  **Educational Value**

### **Learning Outcomes**
1. **Geospatial Data Visualization** - Heatmaps and interactive maps
2. **Environmental Risk Modeling** - Flood prediction algorithms
3. **Web Development** - Frontend/Backend integration
4. **Data Science** - Risk factor analysis and simulation
5. **Emergency Management** - Disaster response planning

### **Academic Applications**
- Urban planning and civil engineering courses
- Environmental science and climate studies
- Computer science web development projects
- Data visualization and GIS applications

## **Future Enhancements**

### **Planned Features**
1. **Real Weather Data Integration** - Live rainfall and flood data
2. **Historical Data Comparison** - Compare current vs historical risks
3. **Evacuation Route Planning** - Optimal escape path calculation
4. **Mobile Application** - iOS/Android companion app
5. **Multi-language Support** - Internationalization
6. **3D Visualization** - Terrain elevation models

### **Technical Improvements**
- Database integration for persistent data
- Machine learning for risk prediction
- Real-time sensor data feeds
- Advanced GIS layer support
- API documentation with Swagger

## 👥 **Contributing**

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow PEP 8 for Python code
- Use semantic HTML5
- Maintain responsive design
- Add comments for complex logic
- Update documentation for new features

##  **License**
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**
- **Leaflet.js** - For the amazing mapping library
- **OpenStreetMap** - For free map tiles


---

** Important Note:** This is a simulation tool for educational purposes. For real flood emergencies, always follow official government warnings and evacuation orders.

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** 🟢 Operational
