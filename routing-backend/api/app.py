from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import geopandas as gpd
from shapely.geometry import Point
import math
import uvicorn
from os import getenv

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GRAPHHOPPER_BASE_URL = getenv("GRAPHHOPPER_BASE_URL", "http://localhost:8989/route")

# Load GeoJSON landmarks data
campus_geojson = "thaparMap.geojson"
landmarks = gpd.read_file(campus_geojson)

# Ensure landmarks use a projected CRS (e.g., EPSG:3857)
if landmarks.crs.is_geographic:
    landmarks = landmarks.to_crs(epsg=3857)


# Function to find landmarks near a point
def find_nearby_landmarks(lat, lng, radius=50):
    point = gpd.GeoSeries([Point(lng, lat)], crs="EPSG:4326")
    point = point.to_crs(landmarks.crs)

    nearby = landmarks[landmarks.geometry.distance(point.iloc[0]) <= radius]

    return [
        {
            "name": landmark.get("name", "Unknown Landmark"),
            "distance": landmark.geometry.distance(point.iloc[0]),
        }
        for _, landmark in nearby.iterrows()
        if landmark.get("name") is not None
    ]


# Function to process route data and augment instructions
def process_route(route):
    augmented_instructions = []
    for path in route["paths"]:
        for instruction in path["instructions"]:

            endpoint = path["points"]["coordinates"][instruction["interval"][1]]
            landmarks = find_nearby_landmarks(endpoint[1], endpoint[0])

            nearest_landmark = min(
                landmarks,
                key=lambda x: x["distance"],
                default={"name": "Unknown Landmark"},
            )

            augmented_instruction = {
                "latitude": endpoint[1],
                "longitude": endpoint[0],
                "text": instruction["text"],
                "distance": instruction["distance"],
                "landmarks": nearest_landmark["name"],
            }

            if "turn_angle" in instruction:
                augmented_instruction["turn_angle"] = instruction["turn_angle"]

            augmented_instructions.append(augmented_instruction)

    return augmented_instructions


# Pydantic models for request and response
class RouteRequest(BaseModel):
    start_coordinates: list[float]
    end_coordinates: list[float]


@app.post("/route_instructions")
async def get_route_instructions(request: RouteRequest):
    base_url = GRAPHHOPPER_BASE_URL

    request_body = {
        "points": [
            [request.start_coordinates[1], request.start_coordinates[0]],
            [request.end_coordinates[1], request.end_coordinates[0]],
        ],
        "profile": "foot",
        "instructions": True,
        "locale": "en_US",
        "points_encoded": False,
        "snap_preventions": ["ferry"],
    }

    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(base_url, json=request_body, headers=headers)

        if response.status_code == 200:
            route_data = response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    coordinate_points = route_data["paths"][0]["points"]["coordinates"]
    augmented_instructions = process_route(route_data)

    route_instructions = []
    for instruction in augmented_instructions:
        landmark_name = instruction["landmarks"]
        instruction_text = instruction["text"]
        latitude = instruction["latitude"]
        longitude = instruction["longitude"]
        distance = instruction["distance"]

        if instruction_text.lower() == "continue":
            instruction_string = (
                f"Continue straight towards {landmark_name} for {distance:.0f}m."
            )
        elif "turn" in instruction_text.lower():
            direction = "left" if "left" in instruction_text.lower() else "right"
            instruction_string = f"Turn {direction}, continue straight towards {landmark_name} for {distance:.0f}m."
        elif "exit" in instruction_text.lower():
            sharp_turn_threshold = math.radians(45)
            turn_angle = instruction.get("turn_angle", 0)

            if abs(turn_angle) > math.pi - sharp_turn_threshold:
                instruction_string = (
                    f"Continue straight towards {landmark_name} for {distance:.0f}m."
                )
            else:
                if turn_angle > 0:
                    direction = "left"
                elif turn_angle < 0:
                    direction = "right"
                else:
                    direction = "straight"

                turn_type = "slight" if abs(turn_angle) <= sharp_turn_threshold else ""

                if direction == "straight":
                    instruction_string = f"Continue straight towards {landmark_name} for {distance:.0f}m."
                else:
                    instruction_string = f"Turn {turn_type} {direction}, continue straight towards {landmark_name} for {distance:.0f}m."
        elif instruction_text.lower() == "arrive at destination":
            instruction_string = f"Arrived at {landmark_name}."

        route_instructions.append(
            {
                "coordinate": {"latitude": latitude, "longitude": longitude},
                "instruction": instruction_string,
            }
        )

    return {"routePath": coordinate_points, "routeInstructions": route_instructions}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
