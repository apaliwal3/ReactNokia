import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProcessType1 from './pages/ProcessType1';
import ProcessType2 from './pages/ProcessType2';
import ProcessType3 from './pages/ProcessType3';
import DataFetcher from './pages/WorkDashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'; // Ensure you have imported the CSS

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          {!isAuthenticated && (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          )}
          {isAuthenticated && (
            <Routes>
              <Route path="/type1" element={<ProtectedRoute element={ProcessType1} />} />
              <Route path="/type2" element={<ProtectedRoute element={ProcessType2} />} />
              <Route path="/type3" element={<ProtectedRoute element={ProcessType3} />} />
              <Route path="/type4" element={<ProtectedRoute element={DataFetcher} />} />
              <Route path="/" element={<Navigate to="/type1" />} />
            </Routes>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
