const sqlite3 = require('sqlite3').verbose();
const dbFile = './db.sql';
const db = new sqlite3.Database(dbFile);

require('../db/seed')(db);
db.close();
