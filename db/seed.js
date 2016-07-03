const fs = require('fs');
const errorHandler = (err) => {
  if (err) {
    console.error(err);
  }
}

module.exports = (db) => {
  db.run(fs.readFileSync(__dirname + '/sql/seed.sql', 'utf8'), [], errorHandler);
}
