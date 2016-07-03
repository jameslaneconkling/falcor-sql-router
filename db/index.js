const sqlite3 = require('sqlite3').verbose();
const dbFile = './db.sql';
const db = process.env.ENV === 'dev' ?
            new sqlite3.Database(':memory:') :
            new sqlite3.Database(dbFile);

// If 'dev' mode:
//   * create in memory db and connect
//   * init tables
//   * seed db
//
// Otherwise, connect to file db and export

if (process.env.ENV === 'dev') {
  require('./init')(db);
  require('./seed')(db);
}

module.exports = db;
