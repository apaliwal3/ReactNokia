import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item"><Link to="/">PROCESS 1</Link></li>
        <li className="navbar-item"><Link to="/type2">PROCESS 2</Link></li>
        <li className="navbar-item"><Link to="/type3">PROCESS 3</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;

