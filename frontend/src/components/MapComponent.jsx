import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { depthLimitedBfs, findBlock } from "../utils/bfs";
import axiosInstance from "../utils/axiosInstance";
import L from "leaflet";
import axios from "axios";
import { useMap } from "react-leaflet";

const MapComponent = ({
  user,
  isDisabled,
  autosLoc,
  activeAutoLoc,
  navType,
}) => {
  const userID = user;
  const [userLocation, setUserLocation] = useState([30.35341, 76.362351]);
  const [searchQuery, setSearchQuery] = useState("");
  const [autos, setAutos] = useState(autosLoc);
  const [activeAuto, setActiveAuto] = useState(activeAutoLoc);
  const [bounds, setMaxBounds] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isRippleVisible, setIsRippleVisible] = useState(false);
  const [status, setHailingStatus] = useState(true);
  const [path, setPath] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [instructionIndex, setInstructionIndex] = useState(0);

  const autoIcon = new L.Icon({
    iconUrl: "/rickshaw.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const destIcon = new L.Icon({
    iconUrl: "/destination.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const userLocIcon = new L.Icon({
    iconUrl: "/userloc.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Fetch user's current location
  useEffect(() => {
    let watcherId; // Store the watcher ID to clear it later

    if (navigator.geolocation) {
      // Use watchPosition to listen to real-time location updates
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]); // Update the location state

          // Set map bounds once when location is obtained
          const bottomLeft = L.latLng([30.3501, 76.35831]);
          const topRight = L.latLng([30.35875, 76.37416]);
          setMaxBounds(L.latLngBounds(bottomLeft, topRight));
        },
        (error) => {
          console.error("Error watching location:", error);
          alert("Could not fetch your location.");
        },
        {
          enableHighAccuracy: true, // Request high accuracy if necessary
          maximumAge: 0, // Always fetch the latest location
          timeout: 5000, // Timeout to avoid hanging
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
    return () => {};
  }, []);

  // for rendering nearby autos on the screen
  useEffect(() => {
    if (navType === "home") {
      // sendBlocks(1);
      axios.get("https://httpbin.org/get").then((res) => {
        setAutos([
          [30.355021, 76.368732],
          [30.353112, 76.359944],
          [30.356721, 76.372876],
          [30.357148, 76.361887],
          [30.354234, 76.362943],
          [30.350941, 76.370123],
          [30.358214, 76.368234],
          [30.351872, 76.360812],
          [30.353019, 76.374123],
          [30.356312, 76.358999],
        ]);
        // console.log(autos);
        // console.log(res.data);
      });
    }
  }, []);

  // // for rendering active auto on the screen
  // useEffect(() => {
  //   if (navType === "hail") {
  //     sendBlocks(2);
  //     axiosInstance.get("/get").then((res) => {
  //       setActiveAuto(res.data);
  //       console.log(res.data);
  //     });
  //   }
  // }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    console.log(userLocation);
    console.log(selectedLocation);

    const requestBody = {
      start_coordinates: [userLocation[0], userLocation[1]],
      // Start point: [longitude, latitude]
      end_coordinates: [
        selectedLocation.lat,selectedLocation.lon // End point: [longitude, latitude]
      ],
    };

    // Set the headers
    const headers = {
      "Content-Type": "application/json",
    };

    axios
      .post(
        "https://routing.shouryadoes.tech/route_instructions",
        requestBody,
        { headers }
      )
      .then((response) => {
        if (response.status === 200) {
          console.log("Success");
          const routeData = response.data;
          console.log(routeData);
          const pathCoordinates = routeData.routePath;
          const pathInstructions = routeData.routeInstructions;
          console.log("route:", pathCoordinates);
          const latLngs = pathCoordinates.map((point) => [point[1], point[0]]);
          setPath(latLngs);
          setIsNavigating(true);
          setInstructions(pathInstructions);
          console.log("huehkejfh", instructions);
          setCurrentInstruction(instructions[0]); 
          setInstructionIndex(0);
        } else {
          console.error(`Error: Received status code ${response.status}`);
          console.error(response.data); // Log the error message from GraphHopper
        }
      })
      .catch((error) => {
        console.error(`An error occurred: ${error.message}`);
      });
  }, [userLocation]);

  useEffect(() => {
    if (!selectedLocation || path.length === 0) return;

    // Continuously track the user's location and update polyline
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = [latitude, longitude];

        setUserLocation(currentLocation); // Update user's location

        const distanceToNextPoint = calculateDistance(currentLocation, path[0]);

        if (distanceToNextPoint < 10) {
          setPath((prevPath) => prevPath.slice(1));
        }
      },
      (error) => {
        console.error("Error watching position:", error);
      }
    );
  }, [path]);

  useEffect(() => {
    if (!instructions || instructions.length === 0) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = [latitude, longitude];

        setUserLocation(currentLocation); // Update user's location

        // Get the current instruction
        if (currentInstruction) {
          const distanceToNextPoint = calculateDistance(currentLocation, [
            currentInstruction.coordinate.latitude,
            currentInstruction.coordinate.longitude,
          ]);

          // If the user is within 10 meters of the next instruction point, update the instruction
          if (distanceToNextPoint < 10) {
            // Move to the next instruction if it's not the last one
            if (instructionIndex < instructions.length - 1) {
              setInstructionIndex((prevIndex) => prevIndex + 1);
            }
            setCurrentInstruction(instructions[instructionIndex]);
          }
        }
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId); // Clean up the geolocation watch
  }, [instructions, instructionIndex]);


const handleStartNavigation = () => {
  setIsNavigating(true);
  // setCurrentInstruction(instructions[0]?.instruction || "Start navigating!");
};

const handleExitNavigation = () => {
  setIsNavigating(false);
  // setCurrentInstruction("");
};

const handleClearSearch = () => {
  setSearchQuery("");
  setSelectedLocation(null);
};


  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5&viewbox=30.3501,76.35831,30.35875,76.37416`
    );
    const data = await response.json();
    setSuggestions(data);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (location) => {
    setSearchQuery(location.display_name);
    setSelectedLocation({
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
    });
    setSuggestions([]);
    // console.log(path);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      const selected = suggestions.find(
        (item) => item.display_name.toLowerCase() === searchQuery.toLowerCase()
      );
      if (selected) {
        handleSuggestionClick(selected);
      }
    }
  };

  // Component to move the map to the selected location
  const SetViewOnClick = ({ lat, lon }) => {
    const map = useMap();
    if (lat && lon) map.setView([lat, lon], 13);
    return null;
  };

  function calculateDistance(coord1, coord2) {
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const lat1 = coord1[0];
    const lon1 = coord1[1];
    const lat2 = coord2[0];
    const lon2 = coord2[1];

    const R = 6371000; // Radius of the Earth in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  const fetchAutoID = async () => {
    const ts = Date.now();
    // const requestID = userID+"_"+ts; // Example requestID
    const requestID = "user1"; // Example requestID
    const { x, y } = findBlock(userLocation[0], userLocation[1]);
    console.log(x, y);
    const grids = depthLimitedBfs(x, y, 2);

    let autoID = null;

    for (const key in grids) {
      const level = grids[key];
      console.log("level", level);

      // Posting to the server
      try {
        await axiosInstance.post("/api/v1/rides/new", {
          requestID: requestID,
          level: level,
          pickup: userLocation,
        });
      } catch (error) {
        console.error("Error posting to /api/rides:", error);
      }

      // Polling for active auto
      while (!autoID) {
        try {
          const res = await axiosInstance.get("/api/v1/rides/status", {
            params: { requestID: requestID },
          });

          console.log("get1", res.status);

          if (res.status === 200) {
            autoID = res.data;
            console.log("autoID", autoID);
          } else if (res.status === 404) {
            console.log("No active auto found, status", res.status);
          }

          if (!autoID.autoID) {
            // Wait 1 second before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("Error fetching auto ID:", error);
          break; // Exit the loop if there's an error
        }
      }

      if (autoID) {
        console.log("autoID2", autoID);
        break; // Exit the loop once autoID is found
      }
    }

    if (autoID) {
      console.log("autoID3", autoID);
      // Polling for auto location
      while (autoID) {
        try {
          const res = await axiosInstance.get("/api/v1/location", {
            params: { autoID: autoID },
          });

          const autoLocation = res.data; // Assuming res.data contains [latitude, longitude]
          const distance = calculateDistance(userLocation, autoLocation);

          console.log(
            `Auto Location: ${autoLocation}, Distance: ${distance} meters`
          );

          if (distance <= 5) {
            console.log("Auto is within 5 meters of the user.");
            setActiveAuto(autoLocation);
            break; // Exit loop if distance is within 5 meters
          }

          setActiveAuto(autoLocation);
          console.log(res.status);

          // Delay for 2 seconds before next polling
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (error) {
          console.error("Error fetching location:", error);
          break; // Exit if there's an error
        }
      }
    } else {
      setHailingStatus(false);
    }
  };

  return (
    <>
      <div className="relative h-screen w-screen">
        {/* Grey Overlay */}
        {isDisabled && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-40 cursor-not-allowed" />
        )}

        {/* Map Section */}
        <MapContainer
          center={userLocation} // Use dynamic location
          zoom={150} // Adjust zoom level
          className="absolute top-0 left-0 w-full h-full z-0"
          dragging={!isDisabled}
          zoomControl={!isDisabled}
          touchZoom={!isDisabled}
          scrollWheelZoom={!isDisabled}
          doubleClickZoom={!isDisabled}
          maxBounds={bounds}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {path.length > 0 && isNavigating && (
            <Polyline positions={path} color="blue" weight={5} />
          )}
          <Marker position={userLocation} icon={userLocIcon} />{" "}
          {/* Marker at user's location */}
          {selectedLocation &&(
              <Marker position={selectedLocation} icon={destIcon} />
            )}{" "}
          {/* Marker at autos */}
          {navType === "home" &&
            autos &&
            autos.map((location, index) => (
              <Marker key={index} position={location} icon={autoIcon} />
            ))}
          {navType === "hail" && activeAuto && (
            <>
              <Marker position={activeAuto} icon={autoIcon} />
              {/* <Routing startLocation={userLocation} endLocation={activeAuto} /> */}
            </>
          )}
        </MapContainer>

        {navType === "hail" && isOverlayVisible && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 ">
            <button
              className="bg-white text-black px-6 py-3 rounded-full shadow-md text-lg font-semibold hover:bg-gray-200"
              onClick={() => {
                setIsOverlayVisible(false);
                fetchAutoID();
              }}
            >
              Tap to Start Looking for a Ride
            </button>
          </div>
        )}

        {navType === "hail" && !status && (
          <div className="absolute bottom-20 w-full text-center z-30">
            <button
              onClick={() => {
                fetchAutoID();
                setHailingStatus(true);
                event.target.style.display = "none";
              }}
              className="bg-white text-black px-4 py-2 rounded shadow-md inline-block transition duration-300 ease-in-out hover:bg-gray-200 active:bg-gray-300"
            >
              Sorry, couldn't request ride, try again?
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="form-control fixed top-2 left-2 right-2 z-30">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered text-center"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg">
              {suggestions.map((location, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSuggestionClick(location)}
                >
                  {location.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Navigation Buttons */}
        <div className="absolute bottom-20 left-4 right-4 z-50">
          {!isNavigating ? (
            <button
              onClick={handleStartNavigation}
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-600"
            >
              Start Navigation
            </button>
          ) : (
            <div>
              <button
                onClick={handleExitNavigation}
                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-red-600"
              >
                Exit Navigation
              </button>
            </div>
          )}
        </div>
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-4">
            Navigation Instructions
          </h2>
          <div className="bg-indigo-50 p-6 rounded-lg shadow-md">
            {currentInstruction ? (
              <p className="text-xl text-gray-700">{currentInstruction.instruction}</p>
            ) : (
              <p className="text-lg text-gray-500">
                Follow the path on the map.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MapComponent;
