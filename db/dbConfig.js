const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// create the UserActivity table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS levelsBeat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL,
    world INTEGER NOT NULL,
    userIp TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    user_id INTEGER
  )`);
});

module.exports = { db };