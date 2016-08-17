const sqlite3 = require('sqlite3').verbose();
const dbFile = './db.sql';
const db = process.env.NODE_ENV === 'development' ?
            new sqlite3.Database(':memory:') :
            new sqlite3.Database(dbFile);

if (process.env.NODE_ENV === 'development') {
  require('./init')(db);
  require('./seed')(db);
}

module.exports = db;
