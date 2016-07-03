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
    body TEXT,
    folderId INTEGER,
    FOREIGN KEY (folderId) REFERENCES resource (id)
  )`);

  db.run(`INSERT INTO folder
    (name, parentId)
    VALUES
    ('folder1', null),
    ('folder2', null),
    ('folder3', null),
    ('folder4', 1),
    ('folder5', 1)
  `);
});

module.exports = db;
