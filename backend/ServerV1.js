const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./auth');
const authMiddleware = require('./middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const PORT = 3001;

app.use(require('cors')());
app.use(express.json()); //Parse JSON
app.use('/auth', authRoutes);

app.post('/upload', [authMiddleware, upload.array('files')], async (req, res) => {

  console.log('Received upload request');
  console.log('Request body:', req.body);
  console.log('Files:', req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  //const filePaths = req.files.map(file => file.path);
  const script = req.body.script;
  const outPath = 'processed/';
  console.log('test');

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const filePath = path.join('/tmp', file.originalname);
      const scriptname='scripts/' + script;

      fs.writeFileSync(filePath, file.buffer);

      console.log(`Processing file: ${filePath}`);
      console.log(`Output path: ${outPath}`);
      console.log(`File name: ${file.originalname}`);

      const process = spawn('python', [scriptname, filePath, outPath, file.originalname]);

      process.on('exit', (code) => {

        //fs.unlinkSync(filePath);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Processing failed for ${file.originalname}`));
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
    await Promise.all(req.files.map(processFile));
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/processed-files', authMiddleware, (req, res) => {
  const processedDir = path.join(__dirname, 'processed');
  fs.readdir(processedDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to list files');
    }
    const fileDetails = files.map(file => {
      const match = file.match(/^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_processed_(.*)$/);
      if (match) {
        const timestamp = match[1];
        const originalName = match[2];
        return {
          url: `http://localhost:3001/download/${file}`,
          originalName: originalName,
          timestamp: timestamp
        };
      } else {
        return null;
      }
    }).filter(file => file !== null);
    
    fileDetails.sort((a, b) => new Date(b.timestamp.replace(/_/g, ':').replace(/-/g, ':')) - new Date(a.timestamp.replace(/_/g, ':').replace(/-/g, ':')));
    res.json(fileDetails);
  });
});

app.get('/download/:filename', authMiddleware, (req, res) => {
  const filePath = path.join(__dirname, 'processed', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, req.params.filename);
  } else {
    res.status(404).send('Processed file not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
