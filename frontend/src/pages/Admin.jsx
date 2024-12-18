import { useState, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import "leaflet-draw/dist/leaflet.draw.css";

const AdminPage = () => {
  const [blockedRoads, setBlockedRoads] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null); // State to track selected admin section

  useEffect(() => {
    console.log("Updated Blocked Roads:", blockedRoads);
  }, [blockedRoads]);

  const handleCreate = (e) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs();

    const newRoads = [];

    if (Array.isArray(latlngs[0])) {
      for (let i = 0; i < latlngs[0].length - 1; i++) {
        newRoads.push([latlngs[0][i], latlngs[0][i + 1]]);
      }
    } else {
      for (let i = 0; i < latlngs.length - 1; i++) {
        newRoads.push([latlngs[i], latlngs[i + 1]]);
      }
    }

    setBlockedRoads((prevBlockedRoads) => [...newRoads, ...prevBlockedRoads]);
  };

  const handleDelete = (e) => {
    const layers = e.layers;
    const roadsToRemove = [];

    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs();

      if (Array.isArray(latlngs[0])) {
        for (let i = 0; i < latlngs[0].length - 1; i++) {
          roadsToRemove.push([latlngs[0][i], latlngs[0][i + 1]]);
        }
      } else {
        for (let i = 0; i < latlngs.length - 1; i++) {
          roadsToRemove.push([latlngs[i], latlngs[i + 1]]);
        }
      }
    });

    setBlockedRoads((prevBlockedRoads) =>
      prevBlockedRoads.filter(
        (road) =>
          !roadsToRemove.some(
            (removeRoad) =>
              JSON.stringify(road[0]) === JSON.stringify(removeRoad[0]) &&
              JSON.stringify(road[1]) === JSON.stringify(removeRoad[1])
          )
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("https://route.shouryadoes.tech", {
        roads: blockedRoads,
      });
      alert("Roads blocked successfully!");
      console.log("Blocked roads sent to server:", response.data);
      setBlockedRoads([]); // Clear the blocked roads
    } catch (error) {
      alert("Failed to block roads. Please try again.");
      console.error("Error:", error);
    }
  };

  const renderSection = () => {
    if (selectedSection === "manageRoads") {
      return (
        <div>
          <h1 className="text-2xl font-bold mb-4">Admin Page - Manage Roads</h1>
          <MapContainer
            center={[30.354155933812432, 76.3663781168519]}
            zoom={17}
            style={{ height: "70vh", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={handleCreate}
                onDeleted={handleDelete}
                draw={{
                  rectangle: false,
                  polygon: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-bold">Blocked Roads</h2>
            <p className="mb-4">
              Total Blocked Segments: <strong>{blockedRoads.length}</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={blockedRoads.length === 0}
            >
              Submit Blocked Roads
            </button>
          </div>
        </div>
      );
    } else if (selectedSection === "manageStudents") {
      return <h1 className="text-2xl font-bold">Manage Students Section</h1>;
    } else if (selectedSection === "manageDrivers") {
      return <h1 className="text-2xl font-bold">Manage Drivers Section</h1>;
    } else {
      return (
        <h1 className="text-2xl font-bold mb-4">
          Welcome to the Admin Dashboard
        </h1>
      );
    }
  };

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        {/* Make buttons stack vertically on small screens */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 sm:justify-center">
          <button
            className="btn btn-primary mb-2 sm:mb-0"
            onClick={() => setSelectedSection("manageStudents")}
          >
            Manage Students
          </button>
          <button
            className="btn btn-primary mb-2 sm:mb-0"
            onClick={() => setSelectedSection("manageDrivers")}
          >
            Manage Drivers
          </button>
          <button
            className="btn btn-primary mb-2 sm:mb-0"
            onClick={() => setSelectedSection("manageRoads")}
          >
            Manage Roads
          </button>
        </div>
      </div>
      {renderSection()}
    </div>
  );
};

export default AdminPage;
