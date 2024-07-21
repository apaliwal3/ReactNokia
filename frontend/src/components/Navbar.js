import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const [hovering, setHovering] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav
      className={`navbar ${hovering ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="sidebar-content">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        <ul className="navbar-list">
          <li className="navbar-item"><Link to="/">PROCESS 1</Link></li>
          <li className="navbar-item"><Link to="/type2">PROCESS 2</Link></li>
          <li className="navbar-item"><Link to="/type3">PROCESS 3</Link></li>
          <li className="navbar-item"><Link to="/type4">Work Tracker</Link></li>
          <li className="navbar-item"><button onClick={handleLogout} className="logout-button">Logout</button></li>
        </ul>
      </div>
      <div className="sidebar-toggle">
        <span className="toggle-icon">{hovering ? '' : '☰'}</span>
      </div>
    </nav>
  );
};

export default Navbar;
