import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"; 
import User from "./pages/User";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home component */}
        <Route path="/map" element={
          <User />
        } /> {/* User component */}
        
      </Routes>
    </Router>
  );
};

export default App;
