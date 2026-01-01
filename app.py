from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import random
from datetime import datetime
import urllib.parse
import os

class FloodAPIHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        # Serve frontend on root path
        if self.path == '/' or self.path == '/index.html':
            self.serve_frontend()
            return
            
        # Serve API data
        elif self.path.startswith('/?'):
            self.serve_api()
            return
            
        # Serve API with /api path (for organized API)
        elif self.path.startswith('/api'):
            self.serve_api()
            return
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def serve_frontend(self):
        """Serve the HTML frontend"""
        try:
            # Try to read index.html
            with open('index.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except Exception as e:
            print(f"Error serving frontend: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'Error loading frontend')
    
    def serve_api(self):
        """Serve the API data"""
        try:
            # Parse query parameters
            parsed_path = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed_path.query)
            
            city = query.get('city', ['New York'])[0]
            rainfall = float(query.get('rainfall', [1.0])[0])
            drainage = float(query.get('drainage', [1.0])[0])
            night = query.get('night', ['false'])[0].lower() == 'true'
            
            print(f"🌧️ API Request - City: {city}, Rainfall: {rainfall}x")
            
            # City coordinates
            cities = {
                'New York': [40.7128, -74.0060],
                'Mumbai': [19.0760, 72.8777],
                'Tokyo': [35.6762, 139.6503],
                'London': [51.5074, -0.1278],
                'Shanghai': [31.2304, 121.4737],
                'Miami': [25.7617, -80.1918]
            }
            
            lat, lng = cities.get(city, [40.7128, -74.0060])
            
            # Generate areas
            areas = []
            for i in range(300):  # Reduced for performance
                area_lat = lat + random.uniform(-0.08, 0.08)
                area_lng = lng + random.uniform(-0.08, 0.08)
                
                # Calculate risk
                base_risk = random.uniform(0.1, 0.8)
                night_mult = 1.3 if night else 1.0
                drain_mult = 1.0 + (1.0 - drainage) * 0.5
                
                final_risk = base_risk * rainfall * drain_mult * night_mult
                final_risk = min(final_risk, 0.95)
                
                # Determine risk level
                if final_risk < 0.33:
                    level = "Low"
                elif final_risk < 0.66:
                    level = "Medium"
                else:
                    level = "High"
                
                areas.append({
                    'id': f'area_{i}',
                    'name': f'Zone {i+1}',
                    'center': [round(area_lat, 6), round(area_lng, 6)],
                    'risk_score': round(final_risk, 3),
                    'risk_level': level,
                    'elevation': round(random.uniform(1, 100), 1),
                    'population': random.randint(1000, 20000),
                    'drainage_quality': round(random.uniform(0.3, 0.9), 2),
                    'river_distance': round(random.uniform(0.5, 15), 1)
                })
            
            # Generate hospitals
            hospitals = []
            hospital_names = [
                "City General Hospital",
                "Riverside Medical Center",
                "Emergency Care Unit",
                "Community Health Center",
                "Metropolitan Hospital"
            ]
            
            for i, name in enumerate(hospital_names):
                hospitals.append({
                    'name': f"{city} {name}",
                    'location': [
                        lat + random.uniform(-0.05, 0.05),
                        lng + random.uniform(-0.05, 0.05)
                    ],
                    'beds': random.randint(100, 500),
                    'emergency_capacity': random.randint(20, 80)
                })
            
            # Prepare response
            response = {
                'areas': areas,
                'hospitals': hospitals,
                'city': city,
                'statistics': {
                    'total_areas': len(areas),
                    'high_risk': len([a for a in areas if a['risk_level'] == 'High']),
                    'medium_risk': len([a for a in areas if a['risk_level'] == 'Medium']),
                    'low_risk': len([a for a in areas if a['risk_level'] == 'Low']),
                    'avg_risk': round(sum(a['risk_score'] for a in areas) / len(areas), 3)
                },
                'timestamp': datetime.now().isoformat(),
                'status': 'success'
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"❌ API Error: {e}")
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {'error': str(e), 'status': 'error'}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

def run_server():
    """Start the server"""
    port = int(os.environ.get('PORT', 5000))
    server_address = ('0.0.0.0', port)
    
    httpd = HTTPServer(server_address, FloodAPIHandler)
    print(f"🚀 Urban Flood Monitor running on port {port}")
    print(f"🌍 Access at: http://localhost:{port}")
    print(f"📡 API endpoint: http://localhost:{port}/api?city=New%20York")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()