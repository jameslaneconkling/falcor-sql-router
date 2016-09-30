const fs = require('fs');

module.exports = db => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(fs.readFileSync(__dirname + '/sql/folder.sql', 'utf8'), [], err => {
        if (err) {
          console.error('Error initializing DB', err);
          return reject(err);
        }

        resolve(null);
      });
      db.run(fs.readFileSync(__dirname + '/sql/resource.sql', 'utf8'), [], err => {
        if (err) {
          console.error('Error initializing DB', err);
          return reject(err);
        }

        resolve(null);
      });
    });
  });
}
