const fs = require('fs');

module.exports = (db, cb=() => {}) => {
  db.run(fs.readFileSync(__dirname + '/sql/seed.sql', 'utf8'), [], err => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    cb(null);
  });
}
