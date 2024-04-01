const express = require("express");
const router = express.Router();
const { db } = require("../db/dbConfig");
const bcrypt = require("bcrypt");
const saltRounds = 10; // for bcrypt password hashing
const jwt = require("jsonwebtoken");
// get dotenv to load the environment variables
require("dotenv").config();
// get the secret from the environment variables
const secret = process.env.JWT;
if (!secret) {
  console.error("No secret found in environment variables");
  secret = "default_secret_that_should_be_changed";
}

// Utility function to get the user's id from their cookie
const getUserIdFromCookie = (cookie) => {
  const decoded = jwt.verify(cookie, secret);
  return decoded.user_id;
};

// Insert a new row into the UserActivity table
const logLevelBeat = (level, world, userIp, timestamp, user_id, medals) => {
  try {
    // if the user_id is not provided, set it to null
    if (!user_id) {
      user_id = null;
    }
    // only log the level if it has 1not been beaten by the user before
    const checkSql = `SELECT * FROM levelsBeat WHERE level = ? AND world = ? AND user_id = ?`;
    db.get(checkSql, [level, world, user_id], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        // update the log with the new medals
        const updateSql = `UPDATE levelsBeat SET medals = ? WHERE level = ? AND world = ? AND user_id = ?`;
        db.run(updateSql, [medals, level, world, user_id], (err) => {
          if (err) {
            return console.error(err.message);
          }
        });
        // don't insert a new row
        return;
      }
    });
    // insert the new row
    const sql = `INSERT INTO levelsBeat (level, world, userIp, timestamp, user_id, medals) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(
      sql,
      [level, world, userIp, timestamp, user_id, medals],
      function (err) {
        if (err) {
          return console.error(err.message);
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
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
    // an array of the medals the user has earned
    let medals = req.body.medals;
    if (medals === undefined) {
      medals = "";
    }
    logLevelBeat(level, world, userIp, timestamp, user_id, medals);
    res
      .status(200)
      .send(
        "Level: " + level + "in world: " + world + " beat by user: " + user_id
      );
  } catch (e) {
    console.error(e);
    res.status(500).send("Error logging level completion");
  }
});

router.get("/api/getLevelsBeat", (req, res) => {
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
    const sql = `SELECT * FROM levelsBeat WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).send(rows);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error getting levels beat");
  }
});

// Registration endpoint
router.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if user or email already exists
    db.get(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email],
      (err, row) => {
        if (err) {
          console.error("Error checking user existence:", err);
          res.status(500).json({ message: "Error checking user existence" });
          return;
        }
        if (row) {
          res.status(409).json({ message: "Username or email already exists" });
          return;
        }

        // Insert new user
        db.run(
          `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
          [username, email, hashedPassword],
          function (err) {
            if (err) {
              console.error("Error registering user:", err);
              res.status(500).json({ message: "Error registering user" });
              return;
            }
            console.log("User registered successfully:", this.lastID);
            res.status(201).json({ message: "User registered successfully" });
          }
        );
      }
    );
  } catch (e) {
    console.error("Error in registration process:", e);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login endpoint
router.post("/api/login", (req, res) => {
  try {
    const { username, password } = req.body;

    db.get(
      `SELECT * FROM users WHERE username = ?`,
      [username],
      async (err, user) => {
        if (err) {
          res.status(500).json({ message: "Error fetching user" });
          return;
        }
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Compare submitted password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          // send the user a cookie signed with the secret
          const token = jwt.sign({ user_id: user.id }, secret);
          res.cookie("user", token, { httpOnly: false });
          res.status(200).json({ message: "Login successful", success: true });
        } else {
          res.status(401).json({ message: "Incorrect password" });
        }
      }
    );
  } catch (e) {
    console.error("Error in login process:", e);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Endpoint to handle feature voting
router.post("/api/voteFeature", (req, res) => {
  try {
    const { featureId } = req.body;
    const token = req.cookies.user;
    if (!token) {
      console.log("Unauthorized vote attempt");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded.user_id;

    // Check if the user has already voted
    db.get(
      `SELECT * FROM featureVotes WHERE user_id = ?`,
      [userId],
      (err, vote) => {
        if (err) {
          console.error("Error checking existing vote:", err);
          return res
            .status(500)
            .json({ message: "Error checking existing vote" });
        }

        if (vote) {
          // change the vote to the new value
          db.run(
            `DELETE FROM featureVotes WHERE user_id = ?`,
            [userId],
            function (err) {
              if (err) {
                console.error("Error deleting vote:", err);
                return res.status(500).json({ message: "Error deleting vote" });
              }
            }
          );
        } 
          // Record new vote
        db.run(
          `INSERT INTO featureVotes (user_id, feature_id) VALUES (?, ?)`,
          [userId, featureId],
          function (err) {
            if (err) {
              console.error("Error recording vote:", err);
              return res
                .status(500)
                .json({ message: "Error recording vote" });
            }
            console.log("New vote for", featureId, "recorded successfully");
            res.status(201).json({ message: "Vote recorded successfully" });
          }
        );
      }
      
    );
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Endpoint for submitting a suggestion
router.post("/api/submitSuggestion", (req, res) => {
  try {
    const { suggestion } = req.body;
    const token = req.cookies.user;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded.user_id;

    db.run(
      `INSERT INTO suggestions (user_id, suggestion) VALUES (?, ?)`,
      [userId, suggestion],
      function (err) {
        if (err) {
          console.error("Error inserting suggestion:", err);
          return res
            .status(500)
            .json({ message: "Error submitting suggestion" });
        }
        res.status(201).json({ message: "Suggestion submitted successfully" });
      }
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
});

module.exports = router;
