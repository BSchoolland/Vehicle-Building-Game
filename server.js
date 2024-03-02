const express = require('express');
const path = require('path');

const app = express();
// Use the PORT environment variable if it's available
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Parse JSON request bodies
app.use(express.json());
// Serve the index.html file when requests are made to the root of the server
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const fs = require('fs');

// an api for logging when a user beats a level
app.post('/api/beat-level', (req, res) => {
  const level = req.body.level;
  const world = req.body.world;
  const userIp = req.ip;
  const timestamp = new Date().toISOString();
  const logMessage = `IP: ${userIp} Level: ${level} World: ${world} Time: ${timestamp}\n`;

  console.log(logMessage);

  fs.appendFile('userActivity.log', logMessage, (err) => {
    if (err) throw err;
  });

  res.status(200).send('Logged successfully');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});