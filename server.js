const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Import your routes

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/community', (req, res) => {
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



// Use your imported routes with the app
app.use(userRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
