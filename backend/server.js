const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./auth');
const authMiddleware = require('./middleware/auth');

const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3001;

app.use(require('cors')());
app.use(express.json()); //Parse JSON
app.use('/auth', authRoutes);

app.post('/upload', [authMiddleware, upload.array('files')], async (req, res) => {
  const filePaths = req.files.map(file => file.path);
  const script = req.body.script;

  const processFile = (filePath) => {
    return new Promise((resolve, reject) => {
      const scriptname='scripts/' + script;
      const process = spawn('python', [scriptname, filePath]);

      process.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Processing failed for ${filePath}`));
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
    await Promise.all(filePaths.map(processFile));
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
      const match = file.match(/^(.*)_processed_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.xlsx$/);
      if (match) {
        const originalName = match[1] + '.xlsx';
        const timestamp = match[2];
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
