import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import FileDownloadList from '../components/FileDownloadList';
import './ProcessType.css'; // Import the CSS file

const ProcessType1 = () => {
  const [uploaded, setUploaded] = useState(false);

  const handleUploadComplete = () => {
    setUploaded(true);
  };

  return (
    <div>
      <h1 className="page-title">RSSI Tracker</h1>
      <FileUpload 
      onUploadComplete={handleUploadComplete} 
      script="RSSI_Tracker.py" 
      uploadDir="uploads/process1"
      processedDir="processed/process1"
      />
      {uploaded && <FileDownloadList />}
    </div>
  );
};

export default ProcessType1;

