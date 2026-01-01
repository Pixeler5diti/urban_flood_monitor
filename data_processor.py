import json
import numpy as np
import random
import requests
from datetime import datetime, timedelta
from sklearn.cluster import KMeans

class RealTimeFloodProcessor:
    def __init__(self):
        self.areas = []
        self.hospitals = []
        self.weather_data = {}
        
    def generate_realistic_city_data(self, city_name="New York"):
        """Generate realistic data for a specific city"""
        self.areas = []
        
        # Base coordinates for major cities
        city_coords = {
            "New York": [40.7128, -74.0060],
            "Mumbai": [19.0760, 72.8777],
            "Tokyo": [35.6762, 139.6503],
            "London": [51.5074, -0.1278],
            "Shanghai": [31.2304, 121.4737],
            "Miami": [25.7617, -80.1918]
        }
        
        base_lat, base_lng = city_coords.get(city_name, [40.7128, -74.0060])
        
        # Generate grid of districts with realistic characteristics
        for i in range(12):
            for j in range(12):
                area_id = f"district_{i}_{j}"
                center_lat = base_lat + (i - 6) * 0.015
                center_lng = base_lng + (j - 6) * 0.015
                
                # Realistic urban patterns
                distance_from_center = np.sqrt((i-6)**2 + (j-6)**2)
                
                # Elevation patterns (lower near water, higher inland)
                elevation = 2 + (distance_from_center * 5) + random.uniform(-3, 3)
                
                # Population density (higher near center)
                population_density = int(15000 * np.exp(-distance_from_center/3) + random.uniform(-2000, 2000))
                
                # Age distribution patterns
                elderly_ratio = 8 + (distance_from_center * 1.5) + random.uniform(-3, 3)
                children_ratio = 25 - (distance_from_center * 1.2) + random.uniform(-5, 5)
                
                # Historical flood probability based on elevation and location
                flood_probability = max(0, (15 - elevation) / 15) + random.uniform(0, 0.3)
                historical_floods = int(flood_probability * 3 + random.uniform(0, 2))
                
                area = {
                    'id': area_id,
                    'name': f'District {chr(65+i)}{j+1}',
                    'city': city_name,
                    'center': [center_lat, center_lng],
                    'bounds': [
                        [center_lat - 0.0075, center_lng - 0.0075],
                        [center_lat + 0.0075, center_lng + 0.0075]
                    ],
                    'elevation': round(max(0, elevation), 1),
                    'population_density': max(100, population_density),
                    'elderly_percentage': round(max(5, min(30, elderly_ratio)), 1),
                    'children_percentage': round(max(10, min(40, children_ratio)), 1),
                    'historical_floods': historical_floods,
                    'nearest_hospital_distance': round(random.uniform(0.5, 8) + distance_from_center * 0.3, 1),
                    'drainage_quality': round(0.3 + random.uniform(0, 0.6) - (distance_from_center * 0.05), 2),
                    'land_use': random.choices(
                        ['residential', 'commercial', 'industrial', 'park', 'waterfront'],
                        weights=[0.5, 0.2, 0.1, 0.1, 0.1]
                    )[0],
                    'infrastructure_age': round(random.uniform(0.1, 1.0), 2)
                }
                self.areas.append(area)
        
        # Generate hospital locations (clustered in urban centers)
        self.hospitals = []
        for k in range(8):
            hospital = {
                'id': f'hospital_{k}',
                'name': f'{city_name} Medical Center {k+1}',
                'location': [
                    base_lat + random.uniform(-0.04, 0.04),
                    base_lng + random.uniform(-0.04, 0.04)
                ],
                'capacity': random.randint(100, 800),
                'emergency_capacity': random.randint(10, 50),
                'flood_resistant': random.choice([True, False, False])
            }
            self.hospitals.append(hospital)
        
        return self.areas, self.hospitals
    
    def fetch_real_weather(self, lat, lng):
        """Fetch real weather data (mock for now, replace with real API)"""
        # In production, replace with:
        # - OpenWeatherMap API
        # - Weather.com API
        # - NOAA API
        
        return {
            'temperature': random.uniform(15, 30),
            'humidity': random.uniform(60, 95),
            'precipitation': random.uniform(0, 50),  # mm
            'wind_speed': random.uniform(0, 15),
            'cloud_cover': random.uniform(0, 100),
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_advanced_risk_score(self, area, rainfall_intensity=1.0, drainage_factor=1.0, 
                                    is_night=False, weather_data=None):
        """Advanced flood risk scoring with real-time factors"""
        
        # Base normalization
        elevation_norm = 1 - min(area['elevation'] / 50, 1.0)
        
        # Population density with logarithmic scaling
        pop_density_norm = min(np.log1p(area['population_density']) / np.log1p(20000), 1.0)
        
        # Vulnerable population (weighted)
        vulnerable_norm = min(
            (area['elderly_percentage'] * 1.2 + area['children_percentage'] * 0.8) / 60,
            1.0
        )
        
        # Hospital distance with exponential decay
        hospital_dist_norm = 1 - np.exp(-area['nearest_hospital_distance'] / 5)
        
        # Historical floods with memory effect
        flood_history_norm = min(area['historical_floods'] / 5, 1.0)
        
        # Infrastructure age factor
        infrastructure_factor = 0.5 + (1 - area['infrastructure_age']) * 0.5
        
        # Land use multiplier
        land_use_multipliers = {
            'waterfront': 1.5,
            'residential': 1.2,
            'commercial': 1.0,
            'industrial': 0.9,
            'park': 0.7
        }
        land_use_mult = land_use_multipliers.get(area['land_use'], 1.0)
        
        # Base risk calculation
        base_risk = (
            0.28 * elevation_norm +
            0.22 * pop_density_norm +
            0.18 * vulnerable_norm +
            0.16 * hospital_dist_norm +
            0.10 * flood_history_norm +
            0.06 * (1 - area['drainage_quality'])
        )
        
        # Apply dynamic multipliers
        rainfall_mult = 1.0 + (rainfall_intensity - 1.0) * 0.6
        drainage_mult = 1.0 + (1.0 - area['drainage_quality']) * drainage_factor
        time_mult = 1.15 if is_night else 1.0
        infra_mult = infrastructure_factor
        
        # Calculate final score
        final_score = base_risk * rainfall_mult * drainage_mult * time_mult * infra_mult * land_use_mult
        
        # Cap at 0.95 (never 1.0 to indicate uncertainty)
        final_score = min(final_score, 0.95)
        
        return {
            'final_score': round(final_score, 4),
            'risk_level': 'Low' if final_score < 0.33 else 'Medium' if final_score < 0.66 else 'High',
            'components': {
                'elevation': round(elevation_norm, 3),
                'population': round(pop_density_norm, 3),
                'vulnerable': round(vulnerable_norm, 3),
                'hospital': round(hospital_dist_norm, 3),
                'history': round(flood_history_norm, 3),
                'drainage': round(1 - area['drainage_quality'], 3)
            },
            'multipliers': {
                'rainfall': round(rainfall_mult, 3),
                'drainage': round(drainage_mult, 3),
                'time': round(time_mult, 3),
                'infrastructure': round(infra_mult, 3),
                'land_use': round(land_use_mult, 3)
            }
        }
    
    def predict_flood_impact(self, area, score_data, duration_hours=24):
        """Predict potential flood impact metrics"""
        score = score_data['final_score']
        
        # Estimate affected population
        area_size = 2.25  # km² (approx 1.5km x 1.5km)
        affected_population = int(area['population_density'] * area_size * score * 0.7)
        
        # Estimate economic impact (simplified)
        economic_impact = affected_population * random.uniform(1000, 5000)
        
        # Emergency response time
        base_response = 15  # minutes
        response_time = base_response * (1 + area['nearest_hospital_distance'] / 5)
        if score > 0.7:
            response_time *= 1.5
        
        return {
            'affected_population': affected_population,
            'economic_impact_millions': round(economic_impact / 1000000, 2),
            'estimated_response_time': round(response_time, 1),
            'evacuation_priority': 'High' if score > 0.7 else 'Medium' if score > 0.4 else 'Low',
            'critical_infrastructure_at_risk': random.randint(0, 5)
        }