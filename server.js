const express = require('express');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Import your routes

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use your imported routes with the app
app.use(userRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
