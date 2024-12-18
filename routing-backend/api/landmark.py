import requests
import geopandas as gpd
from shapely.geometry import Point
import math

campus_geojson = "thaparMap.geojson"
landmarks = gpd.read_file(campus_geojson)

# Ensure landmarks use a projected CRS (e.g., EPSG:3857)
if landmarks.crs.is_geographic:
    landmarks = landmarks.to_crs(epsg=3857)

# Function to find landmarks near a point
def find_nearby_landmarks(lat, lng, radius=50):
    # Convert the point to the same CRS as the landmarks
    point = gpd.GeoSeries([Point(lng, lat)], crs="EPSG:4326")
    point = point.to_crs(landmarks.crs)
    
    # Calculate the distance for each landmark and filter by radius
    nearby = landmarks[landmarks.geometry.distance(point.iloc[0]) <= radius]
    
    return [
        {
            "name": landmark.get("name", "Unknown Landmark"),
            "distance": landmark.geometry.distance(point.iloc[0])  # Calculate and include the distance
        }
        for _, landmark in nearby.iterrows()
        if landmark.get("name") is not None
    ]

def process_route(route):
    augmented_instructions = []
    for path in route['paths']:
        for instruction in path['instructions']:

            endpoint = path['points']['coordinates'][instruction['interval'][1]]
            landmarks = find_nearby_landmarks(endpoint[1], endpoint[0])

            nearest_landmark = min(landmarks, key=lambda x: x['distance'])

            augmented_instruction = {
            "latitude": endpoint[0],
            "longitude": endpoint[1],
            "text": instruction["text"],
            "distance": instruction["distance"],
            "landmarks": nearest_landmark['name'] 

            }
            if "turn_angle" in instruction:
                augmented_instruction["turn_angle"] = instruction["turn_angle"]

            augmented_instructions.append(augmented_instruction)

    return augmented_instructions


start_coordinates = [30.3529363, 76.3613209]  # Starting point
end_coordinates = [30.352642,76.370234]    # Ending point

base_url = "http://localhost:8989/route"
request_body = {
    "points": [
        [start_coordinates[1],start_coordinates[0]],
        [end_coordinates[1], end_coordinates[0]]   
    ],
    "profile": "foot", 
    "instructions": True,  
    "locale": "en_US", 
    "points_encoded": False, 
    "points_encoded_multiplier": 1000000,  
    "details": [
        "road_class", 
        "road_environment", 
        "max_speed", 
        "average_speed"  
    ],
    "snap_preventions": ["ferry"]  
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(base_url, json=request_body, headers=headers)
    
    if response.status_code == 200:
        print("Success")
        route_data = response.json()
    else:
        print(f"Error: Received status code {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"An error occurred: {e}")

# print(route_data)

augmented_instructions = process_route(route_data)

route_instructions=[]
for instruction in augmented_instructions:
    landmark_name = instruction['landmarks']
    instruction_text = instruction['text']
    latitude = instruction['latitude']
    longitude = instruction['longitude']
    distance = instruction['distance']
    
    if instruction_text.lower() == 'continue':
        instruction_string = f"Continue straight towards {landmark_name} for {distance:.0f}m."
    elif 'turn' in instruction_text.lower():
        direction = 'left' if 'left' in instruction_text.lower() else 'right'
        instruction_string = f"Turn {direction}, continue straight towards {landmark_name} for {distance:.0f}m."
    elif 'exit' in instruction_text.lower():

        sharp_turn_threshold = math.radians(45)  
        turn_angle = instruction['turn_angle']

        if abs(turn_angle) > math.pi - sharp_turn_threshold:
            instruction_string = f"Continue straight towards {landmark_name} for {distance:.0f}m."
        else:

            if turn_angle > 0:
                direction = "left"  # Clockwise (positive turn angle)
            elif turn_angle < 0:
                direction = "right"   # Counterclockwise (negative turn angle)
            else:
                direction = "straight"  # No turn angle, continue straight
            
            if abs(turn_angle) > sharp_turn_threshold:
                turn_type = "" 
            else:
                turn_type = "slight"

            if direction == "straight":
                instruction_string = f"Continue straight towards {landmark_name} for {distance:.0f}m."
            else:
                instruction_string = f"Turn {turn_type} {direction}, continue straight towards {landmark_name} for {distance:.0f}m."

    elif instruction_text.lower() == 'arrive at destination':
        instruction_string = f"Arrived at {landmark_name}."

    route_instructions.append({
        'coordinate': {'latitude': latitude, 'longitude': longitude},
        'instruction': instruction_string
    })

print(route_instructions)