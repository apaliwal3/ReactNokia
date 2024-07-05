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
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProcessType1 from './pages/ProcessType1';
import ProcessType2 from './pages/ProcessType2';
import ProcessType3 from './pages/ProcessType3';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProcessType1 />} />
          <Route path="/type2" element={<ProcessType2 />} />
          <Route path="/type3" element={<ProcessType3 />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;


