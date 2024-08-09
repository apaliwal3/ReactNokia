import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPopup.css';

const ErrorPopup = ({ message, onClose }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="error-popup">
      <div className="error-popup-content">
        <p>{message}</p>
        <button onClick={handleLoginRedirect}>Login</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorPopup;