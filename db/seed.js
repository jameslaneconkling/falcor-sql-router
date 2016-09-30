const fs = require('fs');

module.exports = (db, file) => {
  return new Promise((resolve, reject) => {
    db.run(fs.readFileSync(file, 'utf8'), [], err => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      resolve(null);
    });
  });
}
