import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import the CSS file

const Navbar = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">PROCESS 1</Link>
        </li>
        <li className="navbar-item">
          <Link to="/type2">PROCESS 2</Link>
        </li>
        <li className="navbar-item">
          <Link to="/type3">PROCESS 3</Link>
        </li>
        <li className="navbar-item">
          <Link to="/type4">PROCESS 4</Link>
        </li>
        <li className="navbar-item">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
