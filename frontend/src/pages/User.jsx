import React from "react";
import MapComponent from "../components/MapComponent";
import BottomNavigation from "../components/BottomNavigation";

const User = () => {
  const [navType, setNavType] = useState("home");

  const handleNavChange = (type) => {
    setNavType(type);
  };

  return (
    <div>
      {navType !== "recommendations" && (
        <MapComponent
          isDisabled={false}
          autos={[]}
          activeAuto={[]}
          navType={navType}
        />
      )}
      {navType === "recommendations" && <Recommendations navType={navType} />}
      <BottomNavigation navType={navType} onNavChange={handleNavChange} />
    </div>
  );
};

export default User;
