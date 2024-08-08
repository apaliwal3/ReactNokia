import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FileDownloadList.css'; // Import the CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

const FileDownloadList = ({uploaded, processedDir}) => {
  const [fileDetails, setFileDetails] = useState([]);
  const [message, setMessage] = useState('');

  const fetchFileDetails = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      const response = await axios.get('http://localhost:3001/processed-files', {
        headers: {
          'x-auth-token': token, // Add the token to the headers
          'processed-dir': processedDir, // Pass the processed directory
        },
      });
      setFileDetails(response.data);
    } catch (error) {
      setMessage('Error fetching file details');
      console.error('Error fetching file details:', error);
    }
  };

  const handleDownload = async (fileName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found, authorization denied.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/download/${fileName}`, {
        headers: {
          'x-auth-token': token,
          'processed-dir': processedDir,
        },
        responseType: 'blob', // Ensure the response is in blob format for file download
      });

      // Create a temporary URL for the blob and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = (fileName);
      //link.setAttribute('download', "");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setMessage('Error downloading file');
    }
  };

  useEffect(() => {
    fetchFileDetails();
  }, [uploaded, processedDir]);

  return (
    <div className="file-download-container">
      <h2>Processed Files</h2>
      <table className="file-download-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Processed Timestamp</th>
            <th>User</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {fileDetails.map((file, index) => (
            <tr key={index}>
              <td>{file.originalName}</td>
              <td>{file.timestamp}</td>
              <td>{file.user}</td>
              <td>
                <button onClick={() => handleDownload(file.originalName)}>
                  <i className="fas fa-download"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileDownloadList;