module.exports = (db, cb=() => {}) => {
  db.run('DELETE FROM folder; DELETE FROM resource;', [], err => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    cb(null);
  });
};
