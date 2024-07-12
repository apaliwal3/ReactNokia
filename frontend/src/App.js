/*import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileDownload from './components/FileDownload';

const App = () => {
  const [uploaded, setUploaded] = useState(false);

  const handleUploadComplete = () => {
    setUploaded(true);
  };

  return (
    <div>
      <h1>File Processing App</h1>
      <FileUpload onUploadComplete={handleUploadComplete} />
      {uploaded && <FileDownload />}
    </div>
  );
};

export default App;*/

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProcessType1 from './pages/ProcessType1';
import ProcessType2 from './pages/ProcessType2';
import ProcessType3 from './pages/ProcessType3';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div>
        {!isAuthenticated && (
          <Routes>
            {/* <Route path="/signup" element={<Signup />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        )}
        {isAuthenticated && (
          <>
            <Navbar />
            <Routes>
              <Route path="/type1" element={<ProtectedRoute element={ProcessType1} />} />
              <Route path="/type2" element={<ProtectedRoute element={ProcessType2} />} />
              <Route path="/type3" element={<ProtectedRoute element={ProcessType3} />} />
              <Route path="/" element={<Navigate to="/type1" />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;



