import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete, script, uploadDir, processedDir }) => {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('script', script);
    formData.append('uploadDir', uploadDir);
    formData.append('processedDir', processedDir);
    try {
      await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "x-auth-token": localStorage.getItem('token'), // Add the token to the headers
        },
      });
      onUploadComplete();
    } catch (err) {
      setMessage('Error uploading files');
      console.error('Error uploading files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-buttons">
        <label className="file-upload-label">
          Select files to upload
          <input type="file" onChange={handleFileChange} multiple />
        </label>
        <button className="upload-button" onClick={handleUpload} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      <div className="file-info">
        {files.length > 0 && (
          <ul>
            {Array.from(files).map((file, index) => (
              <li key={index}>{file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
            ))}
          </ul>
        )}
      </div>
      {message && <p>{message}</p>}
      {loading && (
        <div className="loading-animation">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;



