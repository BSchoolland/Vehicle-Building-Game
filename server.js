const express = require('express');
const path = require('path');

const app = express();
// Use the PORT environment variable if it's available
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON request bodies
app.use(express.json());
// trust the first proxy
app.set('trust proxy', true);
// Serve the index.html file when requests are made to the root of the server
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const fs = require('fs');

// an api for logging when a user beats a level
app.post('/api/beat-level', (req, res) => {
  try {
    const level = req.body.level;
    const world = req.body.world;
    // make sure level and world are both numbers
    if (typeof level !== 'number' || typeof world !== 'number') {
      res.status(400).send('Invalid level or world');
      return;
    }
    const userIp = req.headers['x-forwarded-for'] || req.ip;
    const timestamp = new Date().toISOString();
    const logMessage = `IP: ${userIp} Level: ${level} World: ${world} Time: ${timestamp}\n`;

    console.log(logMessage);

    fs.appendFile('userActivity.log', logMessage, (err) => { // FIXME: use a proper logging library as using the file system directly can slow down the server if there are many requests
      if (err) throw err;
    });
    
    res.status(200).send('Logged successfully');
  }
  catch (e) {
    console.error(e);
    res.status(500).send('Error logging user activity');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});