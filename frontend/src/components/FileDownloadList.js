import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FileDownloadList.css'; // Import the CSS file
import '@fortawesome/fontawesome-free/css/all.min.css';

const FileDownloadList = () => {
  const [fileDetails, setFileDetails] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get('http://localhost:3001/processed-files', {
          headers: {
            'x-auth-token': token, // Add the token to the headers
          },
        });
        setFileDetails(response.data);
      } catch (error) {
        setMessage('Error fetching file details');
        console.error('Error fetching file details:', error);
      }
    };

    fetchFileDetails();
  }, []);

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
                <a href={file.url} download>
                  <i className="fas fa-download"></i>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileDownloadList;


