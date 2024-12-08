// import React from "react";
// import { useState } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./pages/Home";
// import MapComponent from "./components/MapComponent";


// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         {/* <Route path="/map" element={<MapComponent isDisabled = {false}/>} /> */}
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"; // Ensure Home is imported correctly
import MapComponent from "./components/MapComponent"; // Ensure MapComponent is imported correctly
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home component */}
        <Route path="/map" element={
        <MapComponent
          isDisabled={false}
          autosLoc={[]}
          activeAutoLoc={{}}
          navType={"home"}
        />
      } /> {/* MapComponent component */}
        
      </Routes>
    </Router>
  );
};

export default App;
