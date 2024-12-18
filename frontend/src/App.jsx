import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import AdminPage from "./pages/Admin";
import Auto from "./pages/Auto";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home component */}
        <Route path="/admin" element={<AdminPage />} />{" "}
        <Route path="/map" element={<User />} /> {/* User component */}
        <Route path="/auto" element={<Auto />} /> {/* Auto component */}
        {/* AdminPage component */}
      </Routes>
    </Router>
  );
};

export default App;
