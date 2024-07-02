const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// create the UserActivity table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS levelsBeat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL,
    world INTEGER NOT NULL,
    userIp TEXT NOT NULL,
    timestamp TEXT NOT NULL, 
    medals TEXT,
    user_id INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS featureVotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    feature_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    suggestion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`)
    db.run(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    world INTEGER NOT NULL,
    resources TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`);
  
});

module.exports = { db };