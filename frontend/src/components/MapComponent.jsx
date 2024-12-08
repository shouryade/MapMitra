import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker , GeoJSON} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { depthLimitedBfs, findBlock } from "../utils/bfs";
import axiosInstance from "../utils/axiosInstance";
import L from "leaflet";
// import thaparMap from "../assets/thaparMap.geojson";
// import autoIconImg from "../assets/rickshaw.png";

const MapComponent = ({ isDisabled, autosLoc, activeAutoLoc, navType }) => {
  const [userLocation, setUserLocation] = useState([30.35341, 76.362351]);
  const [searchQuery, setSearchQuery] = useState("");
  // const [destinationLocation, setDestinationLocation] = useState(null);
  const [autos, setAutos] = useState(autosLoc);
  const [activeAuto, setActiveAuto] = useState(activeAutoLoc);
  // const [geoJsonData, setGeoJsonData] = useState(null);
  const [bounds, setMaxBounds] = useState(null);

  // useEffect(() => {
  //   // Fetch the GeoJSON file from the public folder
  //   fetch("/thaparMap.geojson")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("GeoJSON loaded successfully.", data);
  //       setGeoJsonData(data);
  //     })
  //     .catch((error) => console.error("Error loading GeoJSON:", error));
  // }, []);


  const autoIcon = new L.Icon({
    iconUrl:"frontend\public\rickshaw.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Fetch user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log(latitude, longitude);
          var bottomLeft = L.latLng([30.3501, 76.35831]);
          var topRight = L.latLng([30.35875, 76.37416]);
          setMaxBounds(L.latLngBounds(bottomLeft, topRight));
          console.log(bounds);
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Could not fetch your location. Using default location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, [userLocation]);

  // for rendering nearby autos on the screen
  useEffect(() => {
    if (navType === "home") {
      sendBlocks(1);
      axiosInstance.get("/get").then((res) => {
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
        console.log(autos);
        console.log(res.data);
      });
    }
  },[]);

  // for rendering active auto on the screen
  useEffect(() => {
    if (navType === "hail") {
      sendBlocks(2);
      axiosInstance.get("/get").then((res) => {
        setActiveAuto(res.data);
        console.log(res.data);
      });
    }
  }, []);

  function sendBlocks(level) {
    const { x, y } = findBlock(userLocation[0], userLocation[1]);
    console.log(x, y);
    const grids = depthLimitedBfs(x, y, level);
    try {
      axiosInstance.post("/post", { grids }).then((response) => {
        console.log("Response from server:", response.data);
      });
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  }

  // Function to fetch coordinates from Nominatim API
  const fetchLocationCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setDestinationLocation([parseFloat(lat), parseFloat(lon)]);
      } else {
        // alert("Location not found.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      alert("Could not fetch location data.");
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      fetchLocationCoordinates(query);
    }
  };

  return (
    <>
      {/* Grey Overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 z-40 cursor-not-allowed" />
      )}

      {/* Map Section */}
      <MapContainer
        center={userLocation} // Use dynamic location
        zoom={155} // Adjust zoom level
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
        {/* {geoJsonData && <GeoJSON data={geoJsonData} />} */}
        <Marker position={userLocation} /> {/* Marker at user's location */}
        {/* {destinationLocation && <Marker position={destinationLocation} />}{" "} */}
        {/* Marker at autos */}
        {navType === "home" &&
          autos.length !== 0 &&
          autos.map((location, index) => (
            <Marker key={index} position={location} />
          ))}
        {/* Marker at active auto */}
        {navType === "hail" &&
          activeAuto.length !== 0 && ( // Marker at active auto
            <Marker position={activeAuto} icon={autoIcon} />
          )}
        {/* Ripples at User location */}
        {navType === "hail" && activeAuto.length === 0 && (
          <Circle center={[50.5, 30.5]} radius={200} />
        )}
        {/* Marker at destination */}
      </MapContainer>

      {/* Search Input */}
      <div className="form-control fixed top-2 left-2 right-2 z-30">
        {/* <input
          type="text"
          placeholder="Search"
          className="input input-bordered text-center"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isDisabled}
        /> */}

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
          <div className="absolute left-0 right-0 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg">
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
    </>
  );
};

export default MapComponent;
