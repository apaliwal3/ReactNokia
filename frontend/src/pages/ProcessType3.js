import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import FileDownloadList from '../components/FileDownloadList';
import './ProcessType.css'; // Import the CSS file

const ProcessType3 = () => {
  const [uploaded, setUploaded] = useState(false);

  const handleUploadComplete = () => {
    setUploaded(true);
  };

  return (
    <div>
      <h1 className="page-title">PROCESS 3</h1>
      <FileUpload onUploadComplete={handleUploadComplete} script="process_excel_type3.py" />
      {uploaded && <FileDownloadList />}
    </div>
  );
};

export default ProcessType3;