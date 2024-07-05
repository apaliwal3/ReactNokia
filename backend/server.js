/*const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3001;

app.use(require('cors')());

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  res.json({ filePath });
});

app.get('/process', (req, res) => {
  const filePath = req.query.filePath;
  
  const process = spawn('python', ['scripts/process_excel.py', filePath]);
  
  process.on('exit', (code) => {
    if (code === 0) {
      res.sendStatus(200);
    } else {
      res.status(500).send('Processing failed');
    }
  });

  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'processed', 'result.xlsx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'processed_file.xlsx');
  } else {
    res.status(404).send('Processed file not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/


const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3001;

app.use(require('cors')());

app.post('/upload', upload.array('files'), async (req, res) => {
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

app.get('/processed-files', (req, res) => {
  const processedDir = path.join(__dirname, 'processed');
  fs.readdir(processedDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to list files');
    }
    const fileDetails = files.map(file => {
      const match = file.match(/^(.*)_processed_(\d{14})\.xlsx$/);
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
    res.json(fileDetails);
  });
});

app.get('/download/:filename', (req, res) => {
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
