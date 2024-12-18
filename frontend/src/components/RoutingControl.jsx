import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

const Routing = ({ startLocation, endLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!startLocation || !endLocation) return;
    console.log("helloworld");
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startLocation[0], startLocation[1]),
        L.latLng(endLocation[0], endLocation[1]),
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
      createMarker: () => null, // Prevent default markers if you want custom ones
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [startLocation, endLocation]);

  return null;
};

export default Routing;
