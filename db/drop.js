module.exports = (db, cb=() => {}) => {
  db.run('DROP TABLE folder; DROP TABLE resource;', [], err => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    cb(null);
  });
};
