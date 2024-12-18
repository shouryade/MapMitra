import React from "react";
import MapComponent from "../components/MapComponent";
import { useState } from "react";
import BottomNavigation from "../components/BottomNavigation";

const User = () => {
  const [navType, setNavType] = useState("home");

  const handleNavChange = (type) => {
    setNavType(type);
  };

  return (
    <div>
      {navType === "home" && (
        <MapComponent
          user={"abc"}
          isDisabled={false}
          autosLoc={null}
          activeAutoLoc={null}
          navType={"home"}
        />
      )}
      {navType === "hail" && (
        <MapComponent
          user="abc"
          isDisabled={false}
          autosLoc={null}
          activeAutoLoc={null}
          navType="hail"
        />
      )}
      {navType === "recommendations" && (
        <div>Here are your recommendations!</div>
      )}
      {/* <BottomNavigation navType={navType} onNavChange={handleNavChange} /> */}
      <BottomNavigation navType={navType} onNavChange={handleNavChange} />
    </div>
  );
};

export default User;
