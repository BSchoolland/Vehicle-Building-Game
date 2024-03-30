const express = require('express');
const router = express.Router();
const { db } = require('../db/dbConfig');
const bcrypt = require('bcrypt');
const saltRounds = 10; // for bcrypt password hashing

// Utility function to get the user's id from their cookie
const getUserIdFromCookie = (cookie) => {
    const cookieParts = cookie.split("=");
    const userId = cookieParts[1];
    return userId;
};

// Insert a new row into the UserActivity table
const logLevelBeat = (level, world, userIp, timestamp, user_id) => {
    // if the user_id is not provided, set it to null
    if (!user_id) {
      user_id = null;
    }
    const sql = `INSERT INTO levelsBeat (level, world, userIp, timestamp, user_id) VALUES (?, ?, ?, ?, ?)`;
  
    db.run(
      sql,
      [level, world, userIp, timestamp, user_id],
      function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`The level was logged with row id ${this.lastID}`);
      }
    );
  };

// an api for logging when a user beats a level
router.post("/api/beat-level", (req, res) => {
    try {
      const level = req.body.level;
      const world = req.body.world;
      const userIp = req.ip;
      const timestamp = new Date().toISOString();
      // check for the user's cookie
      let user_id;
      if (!req.cookies || !req.cookies.user) {
        user_id = null;
      } else {
        user_id = getUserIdFromCookie(req.cookies.user);
      }
      logLevelBeat(level, world, userIp, timestamp, user_id);
      res
        .status(200)
        .send("Level: " + level + "in world: " + world + " successfully logged");
    } catch (e) {
      console.error(e);
      res.status(500).send("Error logging level completion");
    }
  });

// an api for getting the number of levels a user has beaten
router.get("/api/num-levels-beat", (req, res) => {
    try {
      // get the user's cookie
      const userCookie = req.cookies.user;
      // if the user is not logged in, tell the client
      if (!userCookie) {
        res.status(401).send("User not logged in");
        return;
      }
      // get the user's id from the cookie
      const userId = getUserIdFromCookie(userCookie);
      // create the sql query to get the levels the user has beaten
      const sql = `SELECT COUNT(*) FROM levelsBeat WHERE user_id = ?`;
      db.get(sql, [userId], (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        res.status(200).send(row["COUNT(*)"].toString());
      });
    } catch (e) {
      console.error(e);
      res.status(500).send("Error getting levels beat");
    }
});

// Registration endpoint
router.post("/api/register", async (req, res) => {
  console.log('Registration request received:', req.body);
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully');

    // Check if user or email already exists
    db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email], (err, row) => {
      if (err) {
        console.error('Error checking user existence:', err);
        res.status(500).send("Error checking user existence");
        return;
      }
      if (row) {
        console.log('User or email already exists:', row);
        res.status(409).send("Username or email already exists");
        return;
      }

      // Insert new user
      db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashedPassword], function(err) {
        if (err) {
          console.error('Error registering user:', err);
          res.status(500).send("Error registering user");
          return;
        }
        console.log('User registered successfully:', this.lastID);
        res.status(201).send("User registered successfully");
      });
    });
  } catch (e) {
    console.error('Error in registration process:', e);
    res.status(500).send("Error registering user");
  }
});

// Login endpoint
router.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if (err) {
          res.status(500).send("Error fetching user");
          return;
      }
      if (!user) {
          res.status(404).send("User not found");
          return;
      }

      // Compare submitted password with stored hashed password
      const match = await bcrypt.compare(password, user.password);
      if (match) {
          // Assuming you'll handle sessions or JWT tokens here
          res.status(200).send("Login successful");
      } else {
          res.status(401).send("Incorrect password");
      }
  });
});

module.exports = router;
