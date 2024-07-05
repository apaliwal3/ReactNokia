/*import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await axios.get(`http://localhost:3001/process?filePath=${res.data.filePath}`);
      onUploadComplete();

    } catch (err) {
      console.error('Error uploading file: ', err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUpload;*/

import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete, script }) => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('script', script);

    try {
      await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadComplete();
    } catch (err) {
      console.error('Error uploading files:', err);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-buttons">
        <label className="file-upload-label">
          Select files to upload
          <input type="file" onChange={handleFileChange} multiple />
        </label>
        <button className="upload-button" onClick={handleUpload}>Upload</button>
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
    </div>
  );
};

export default FileUpload;



