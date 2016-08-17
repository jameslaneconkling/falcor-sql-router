const sqlite3 = require('sqlite3').verbose();
const dbFile = './db.sql';
const db = process.env.ENV === 'dev' ?
            new sqlite3.Database(':memory:') :
            new sqlite3.Database(dbFile);

if (process.env.ENV === 'dev') {
  require('./init')(db);
  require('./seed')(db);
}

module.exports = db;
