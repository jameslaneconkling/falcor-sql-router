const sqlite3 = require('sqlite3').verbose();
const dbFile = './db.sql';
const db = process.env.NODE_ENV === 'production' ?
            new sqlite3.Database(dbFile) :
            new sqlite3.Database(':memory:');

if (process.env.NODE_ENV === 'development') {
  require('./init')(db);
  require('./seed')(db);
} else if (process.env.NODE_ENV === 'test') {
  require('./init')(db);
}

module.exports = db;
