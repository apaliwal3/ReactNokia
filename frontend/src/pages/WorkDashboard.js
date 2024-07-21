import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DataFetcher = () => {
  const [data, setData] = useState({ manager: [], employee: [], client: [] });
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/data', {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the request headers
          },
          params: {
            role: role // Send role as query parameter
          }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [role, token]);

  return (
    <div>
      {role === 'manager' && (
        <div>
          <h1>Manager Dashboard</h1>
          <pre>{JSON.stringify(data.manager, null, 2)}</pre>
        </div>
      )}
      {role === 'employee' && (
        <div>
          <h1>Employee Dashboard</h1>
          <pre>{JSON.stringify(data.employee, null, 2)}</pre>
        </div>
      )}
      {role === 'client' && (
        <div>
          <h1>Client Dashboard</h1>
          <pre>{JSON.stringify(data.client, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DataFetcher;
