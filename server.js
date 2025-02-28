const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Import your routes
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// environment variables
require("dotenv").config();

// a cookie parser to parse the user's cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/index/index.html'));
});

app.get('/levels', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/levels/levels.html'));
});

app.get('/levels.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/levels/levels.html'));
});

app.get('/changelog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/changeLog/changeLog.html'));
});

app.get('/changeLog.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/changeLog/changeLog.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/login/login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/login/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/register/register.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/register/register.html'));
});

app.get('/sandbox', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/sandbox/sandbox.html'));
});

app.get('/sandbox.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/sandbox/sandbox.html'));
});

// I'll allow editor access with the direct link, but it's not linked anywhere
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/editor/editor.html'));
});

app.get('/editor.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/editor/editor.html'));
});

app.get('/mylevel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/editor/mylevel.html'));
});

app.get('/mylevel.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/editor/mylevel.html'));
});

app.get('/other-games', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/other-games/other-games.html'));
});

app.get('/other-games.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/other-games/other-games.html'));
});

// api for getting all enemies
app.get('/api/enemies', (req, res) => {
  console.log("enemies requested");
  fs.readdir('public/json-enemies', (err, files) => {
      if (err) {
          res.status(500).send('Server error');
          return;
      }

      let enemies = {};
      files.forEach(file => {
          let fileName = path.basename(file, '.json');
          enemies[fileName] = `/json-enemies/${file}`;
      });

      res.json(enemies);
  });
});

// Use your imported routes with the app
app.use(userRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
