const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE folder (
    id INTEGER PRIMARY KEY,
    name TEXT,
    parentId INTEGER,
    FOREIGN KEY (parentId) REFERENCES folder (id)
  )`);

  db.run(`CREATE TABLE resource (
    id INTEGER PRIMARY KEY,
    name TEXT,
    body TEXT
  )`);
});

module.exports = db;
