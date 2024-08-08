import React, { useState } from "react";
import axios from "axios";
import { parseISO, format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProcessType4 = () => {
  const [graphData, setGraphData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [primaryKey, setPrimaryKey] = useState("");
  const excludedColumns = ["Date"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let sqlQuery =
      'SELECT "Date","SDCCH BLOCKING RATE","TCH CALL BLOCKING" FROM "VDC_TNZ_2G_PLMN_NBH" WHERE "Date" IS NOT NULL';

    if (startDate) {
      sqlQuery += ` AND "Date" >= '${startDate}'`;
    }
    if (endDate) {
      sqlQuery += ` AND "Date" <= '${endDate}'`;
    }
    if (primaryKey) {
      sqlQuery += ` AND "PrimaryKeyColumn" = '${primaryKey}'`;
    }

    sqlQuery += ' GROUP BY "Date", "SDCCH BLOCKING RATE", "TCH CALL BLOCKING"';

    try {
      const response = await axios.post(
        "http://localhost:3001/api/graph-data",
        { sqlQuery },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );

      // Parse the date string into a Date object and sort the data by date
      const parsedData = response.data
        .map((item) => ({
          ...item,
          Date: parseISO(item.Date),
        }))
        .sort((a, b) => new Date(a.Date) - new Date(b.Date));

      setGraphData(parsedData);

      // Extract columns from the data
      if (parsedData.length > 0) {
        setColumns(
          Object.keys(parsedData[0]).filter(
            (col) => !excludedColumns.includes(col)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  // Custom formatter for the XAxis to display dates in a readable format
  const dateFormatter = (date) => format(new Date(date), "yyyy-MM-dd");

  return (
    <div>
      <h1 className="page-title">VodaCom 2G PLMN NBH Graph</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#628cf5",
          padding: "20px",
          borderRadius: "8px",
          color: "white",
          display: "flex"
        }}
      >
        <div style={{ marginBottom: "10px", backgroundColor: "#314f99", width: "25vw",marginRight: "10px", height: "5vh", paddingTop: "5px" }}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "10px", backgroundColor: "#314f99",marginRight: "10px", height: "5vh", paddingTop: "5px", width: "20vw"  }}>
          <label>
            Primary Key:
            <input
              type="text"
              value={primaryKey}
              onChange={(e) => setPrimaryKey(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "50%"
          }}
        >
          Fetch Graph Data
        </button>
      </form>

      {columns.map((col) => (
        <div key={col}>
          <h2>{col}</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" tickFormatter={dateFormatter} />
              <YAxis />
              <Tooltip labelFormatter={dateFormatter} />
              <Legend />
              <Line type="monotone" dataKey={col} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default ProcessType4;
