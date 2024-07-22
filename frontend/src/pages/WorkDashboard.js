import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

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

  const renderTable = (data) => {
    if (data.length === 0) return <p>No data available</p>;

    const headers = Object.keys(data[0]);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>{row[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <div>
      {role === 'manager' && (
        <div>
          <h1>Manager Dashboard</h1>
          {renderTable(data.manager)}
          <h1>Employee Dashboard</h1>
          {renderTable(data.employee)}
        </div>
      )}
      {role === 'employee' && (
        <div>
          <h1>Employee Dashboard</h1>
          {renderTable(data.employee)}
        </div>
      )}
      {role === 'client' && (
        <div>
          <h1>Client Dashboard</h1>
          {renderTable(data.client)}
        </div>
      )}
    </div>
  );
};

export default DataFetcher;
