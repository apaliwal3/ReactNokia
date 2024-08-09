const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const authRoutes = require("./auth");
const xlsx = require('xlsx');
const authMiddleware = require("./middleware/auth");

const setUploadDir = (req, res, next) => {
  console.log('Request body:', req.body.uploadDir);
  req.uploadDir = req.body.uploadDir || 'uploads/';
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = req.body.uploadDir || 'uploads/';
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

const pool = new Pool({
  user: "postgres",
  host: "10.133.132.90",
  database: "cno_prod",
  password: "12345",
  port: 5432,
});

const processedDirs = {};
const processedFilesInfo = {};

const emptyDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        emptyDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
};

app.post("/api/graph-data", authMiddleware, async (req, res) => {
  const { sqlQuery } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(sqlQuery);
    const data = result.rows;
    client.release();
    // Send the data as it is, sorting will be done on the frontend
    res.json(data);
  } catch (err) {
    console.error("Error executing SQL query:", err.message);
    res.status(500).send("Server error");
  }
});

app.post('/upload', [authMiddleware, setUploadDir, upload.array('files')], async (req, res) => {
  const uploadDir = path.join(__dirname, req.uploadDir);
  console.log(req.uploadDir);
  console.log('Upload directory:', uploadDir);
  const processedDir = path.join(__dirname, req.body.processedDir || 'processed');
  console.log('Processed directory:', processedDir);
  const script = req.body.script;

  const userID = req.user.id;
  processedDirs[userID] = processedDir;

  const processFiles = (uploadDir, processedDir) => {
    return new Promise((resolve, reject) => {
      const scriptname = 'scripts/' + script;
      const process = spawn('python', [scriptname, uploadDir, processedDir]);

      process.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Processing failed for directory ${uploadDir}`));
        }
      });

      process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    });
  };

  try {
    await processFiles(uploadDir, processedDir);
    res.sendStatus(200);
    emptyDirectory(uploadDir);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/processed-files', authMiddleware, (req, res) => {
  
  const userId = req.user.id; // Assuming req.user.id is available from authMiddleware
  const processedDir = req.headers['processed-dir'] ||  processedDirs[userId] || path.join(__dirname, 'processed');
  console.log('Processed retrieve directory:', processedDir);
  fs.readdir(processedDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to list files');
    }
    const fileDetailsPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(processedDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            return reject(err);
          }
          const originalName = path.basename(file);
          console.log('Original name:', originalName);
          const timestamp = new Date(stats.mtime).toLocaleString().replace(/,/, '').replace(/:/g, '-').replace(/ /g, '_');
          resolve({
            url: `http://localhost:3001/download/${file}`,
            originalName: originalName,
            timestamp: timestamp,
            user: userId
          });
        });
      });
    });

    Promise.all(fileDetailsPromises)
      .then(fileDetails => {
        fileDetails.sort((a, b) => new Date(b.timestamp.replace(/_/g, 'T').replace(/-/g, ':')) - new Date(a.timestamp.replace(/_/g, 'T').replace(/-/g, ':')));
        res.json(fileDetails);
      })
      .catch(err => {
        res.status(500).send('Error retrieving file details');
      });
  });
});

app.get('/download/:filename', authMiddleware, (req, res) => {
  const userId = req.user.id; // Assuming req.user.id is available from authMiddleware
  const processedDir = path.join(__dirname, req.headers['processed-dir']) || processedDirs[userId] || path.join(__dirname, 'processed');
  const filePath = path.join(processedDir, req.params.filename);
  console.log('Download file:', filePath);
  const fileExists = fs.existsSync(filePath);
  console.log('File exists:', fileExists);
  if (fileExists) {
    res.download(filePath);
  } else {
    res.status(404).send('Processed file not found');
  }
});

// Endpoint to fetch data from Excel based on role
app.get('/api/data', authMiddleware, (req, res) => {
  const role = req.query.role; // Get the role from query parameters

  // Define the path to your Excel file
  const excelFilePath = path.join(__dirname, 'data/Data.xlsx');

try {
  // Read the Excel file
  const workbook = xlsx.readFile(excelFilePath);
  console.log('Workbook loaded:', workbook);

  // Fetch data from each sheet based on role
  const data = {
    manager: [],
    employee: [],
    client: []
  };

  if (role === 'manager') {
    const sheet = workbook.Sheets['Managers']; // Correct sheet name
    console.log('Manager sheet:', sheet);
    data.manager = xlsx.utils.sheet_to_json(sheet);
  } else if (role === 'employee') {
    const sheet = workbook.Sheets['Employees']; // Correct sheet name
    console.log('Employee sheet:', sheet);
    data.employee = xlsx.utils.sheet_to_json(sheet);
  } else if (role === 'client') {
    const sheet = workbook.Sheets['Clients']; // Correct sheet name
    console.log('Client sheet:', sheet);
    data.client = xlsx.utils.sheet_to_json(sheet);
  } else {
    return res.status(400).json({ error: 'Invalid role' });
  }

  console.log('Fetched data:', data);
  res.json(data);
} catch (error) {
  console.error('Error reading Excel file:', error);
  res.status(500).json({ error: 'Error reading Excel file' });
}
});

// Add this in server.js
// In your server.js or equivalent file
app.post("/create-tracker", authMiddleware, upload.single("script"), (req, res) => {
  console.log("Create Tracker Request received.");
  
  // Check if the file and trackerName are received
  const { trackerName } = req.body;
  const scriptFile = req.file;

  console.log("Tracker Name:", trackerName);
  console.log("Uploaded Script File:", scriptFile);

  if (!trackerName || !scriptFile) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  // Assuming you save the file and create the tracker here
  const scriptFilePath = `./scripts/${scriptFile.filename}`;

  // Assuming you also save the tracker details in a database or a file
  try {
    // Save tracker logic
    console.log("Tracker creation logic goes here");

    // Simulate successful creation
    return res.status(201).json({ msg: "Tracker created successfully" });
  } catch (error) {
    console.error("Error creating tracker:", error);
    return res.status(500).json({ msg: "Failed to create tracker, please try again" });
  }
});


// Example for handling dynamic routing based on tracker name
app.post('/upload/:trackerName', [authMiddleware, setUploadDir, upload.array('files')], async (req, res) => {
  const trackerName = req.params.trackerName;
  const trackersDir = path.join(__dirname, 'trackers');
  const trackerDir = path.join(trackersDir, trackerName);
  
  if (!fs.existsSync(trackerDir)) {
    return res.status(404).send("Tracker not found.");
  }

  const scriptPath = fs.readdirSync(trackerDir).find(file => file.endsWith('.py'));
  if (!scriptPath) {
    return res.status(500).send("Tracker script not found.");
  }

  const processFiles = (uploadDir, processedDir) => {
    return new Promise((resolve, reject) => {
      const process = spawn('python', [path.join(trackerDir, scriptPath), uploadDir, processedDir]);

      process.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Processing failed for tracker ${trackerName}`));
        }
      });

      process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    });
  };

  try {
    await processFiles(req.uploadDir, trackerDir);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
