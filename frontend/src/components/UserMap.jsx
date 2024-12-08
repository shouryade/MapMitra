import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { findBlock } from "../utils/bfs";
import axiosInstance from "../utils/axiosInstance";

const UserMap = ({location}) => {
  const [autos, setAutos] = useState([]);

  const autoIcon = new L.Icon({
    iconUrl: "../assets/rickshaw.png", // Replace with the path to your custom icon image
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Anchor point of the icon
    popupAnchor: [0, -32], // Popup anchor position
  });


  useEffect(() => {
    console.log(location);
    const { x, y } = findBlock(location[0], location[1]);
    console.log(x, y);
    axiosInstance.get("/get").then((res) => {
      setAutos([
        [30.357155933812432, 76.3663781168519],
        [30.357155933812432, 76.3585708],
        [30.357155933812432, 76.36481665348153],
        [30.35446100028746, 76.36950104359268],
        [30.357155933812432, 76.37106250696306],
        [30.3504186, 76.36325519011115],
        [30.351766066762487, 76.3585708],
        [30.351766066762487, 76.36793958022228],
        [30.35850340057492, 76.3585708],
        [30.355808467049947, 76.36169372674075],
      ]);
      console.log(res.data);
      console.log(autos );
    });
  }, [autos]);

  return (
    <>
    <MapContainer>
      {autos.map((location, index) => (
        <Marker key={index} position={location} icon={autoIcon} />
      ))}
      </MapContainer>
    </>
  );
};

export default UserMap;
