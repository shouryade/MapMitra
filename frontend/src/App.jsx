import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import AdminPage from "./pages/Admin";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home component */}
        <Route path="/admin" element={<AdminPage />} />{" "}
        <Route path="/map" element={<User />} /> {/* User component */}
        {/* AdminPage component */}
      </Routes>
    </Router>
  );
};

export default App;
