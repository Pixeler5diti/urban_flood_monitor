from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import random
from datetime import datetime
import urllib.parse

class FloodAPIHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        # Handle CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Parse parameters
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        
        city = query.get('city', ['New York'])[0]
        rainfall = float(query.get('rainfall', [1.0])[0])
        drainage = float(query.get('drainage', [1.0])[0])
        night = query.get('night', ['false'])[0].lower() == 'true'
        
        print(f"Request: city={city}, rain={rainfall}, drain={drainage}, night={night}")
        
        # City coordinates
        cities = {
            'New York': [40.71, -74.00],
            'Mumbai': [19.07, 72.87],
            'Tokyo': [35.67, 139.65],
            'London': [51.50, -0.12],
            'Shanghai': [31.23, 121.47],
            'Miami': [25.76, -80.19]
        }
        
        lat, lng = cities.get(city, [40.71, -74.00])
        
        # Generate 500 random points around the city
        areas = []
        for i in range(500):
            # Spread points in a 0.2 degree radius (~22km)
            area_lat = lat + random.uniform(-0.1, 0.1)
            area_lng = lng + random.uniform(-0.1, 0.1)
            
            # Calculate risk
            base_risk = random.uniform(0.1, 0.9)
            
            # Apply multipliers
            night_mult = 1.3 if night else 1.0
            drain_mult = 1.0 + (1.0 - drainage) * 0.5
            
            final_risk = base_risk * rainfall * drain_mult * night_mult
            final_risk = min(final_risk, 0.95)
            
            if final_risk < 0.33:
                level = "Low"
            elif final_risk < 0.66:
                level = "Medium"
            else:
                level = "High"
            
            areas.append({
                'id': f'area_{i}',
                'name': f'Zone {i+1}',
                'center': [area_lat, area_lng],
                'risk_score': round(final_risk, 3),
                'risk_level': level,
                'elevation': round(random.uniform(1, 100), 1),
                'population': random.randint(1000, 20000),
                'drainage': round(random.uniform(0.3, 0.9), 2)
            })
        
        # Generate 5 hospitals
        hospitals = []
        for i in range(5):
            hospitals.append({
                'name': f'Hospital {i+1}',
                'location': [
                    lat + random.uniform(-0.05, 0.05),
                    lng + random.uniform(-0.05, 0.05)
                ],
                'beds': random.randint(50, 300)
            })
        
        response = {
            'areas': areas,
            'hospitals': hospitals,
            'city': city,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }
        
        self.wfile.write(json.dumps(response).encode())

def run():
    server = HTTPServer(('localhost', 5000), FloodAPIHandler)
    print("✅ Server running at http://localhost:5000")
    print("🌍 Test URL: http://localhost:5000/?city=Mumbai&rainfall=2.0")
    server.serve_forever()

if __name__ == '__main__':
    run()