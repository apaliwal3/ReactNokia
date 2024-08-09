import React, { useState } from 'react';
import axios from 'axios';

const TrackerCreator = () => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !file) {
      setMessage('Please enter a name and upload a Python file.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:3001/create-tracker',
        formData,
        {
          headers: { "x-auth-token": localStorage.getItem("token") }
        }
      );
      setMessage('Tracker created successfully!');
    } catch (error) {
      console.error('Error creating tracker:', error);
      setMessage('Failed to create tracker, please try again.');
    }
  };

  return (
    <div>
      <h1>Create New Tracker</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Tracker Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Upload Python File:
            <input
              type="file"
              accept=".py"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>
        <button type="submit">Generate Tracker</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TrackerCreator;
