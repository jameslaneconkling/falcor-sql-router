const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res, next) => {
  db.all('SELECT * FROM folder LIMIT 10', [], (err, rows) => {
    if (err) {
      next(err);
    }
    res.status(200).send({
      data: rows
    });
  });
});

router.post('/', (req, res, next) => {
  db.run(`INSERT INTO folder
    (name)
    VALUES
    ($name)
  `, {$name: req.body.name}, function(err) {
    if (err) {
      next(err);
    }
    res.status(200).send({
      id: this.lastID
    });
  });
});

module.exports = router;
