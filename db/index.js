const sqlite3 = require('sqlite3').verbose();

/**
 * DatabaseDriver Constructor
 *
 * @param {Object} config
 *   file {String | Boolean} path to sqlite db file.  pass false to run in memory
 *   seed {String | Boolean} path to db seed file.  pass false to not seed the db
 *
 * @return database driver object
 */
module.exports = ({file = false, seed = false}) => {
  const db = file ? new sqlite3.Database(file) : new sqlite3.Database(':memory:');

  return Promise.all([
    !file ? require('./init')(db) : Promise.resolve(),
    seed ? require('./seed')(db, seed) : Promise.resolve()
  ])
    .then(() => db)
};
