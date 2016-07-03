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

router.get('/:id', (req, res, next) => {
  db.get('SELECT * FROM folder WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      next(err);
    }
    res.status(200).send({
      data: row
    });
  });
});

router.get('/:id/children', (req, res, next) => {
  db.all('SELECT * FROM folder WHERE parentId = ?', [req.params.id], (err, rows) => {
    if (err) {
      next(err);
    }
    res.status(200).send({
      data: rows
    });
  });
});

router.post('/', (req, res, next) => {
  // TODO - prevent self-referencing folders
  db.run(`INSERT INTO folder
    (name, parentId)
    VALUES
    ($name, $parentId)
  `, {
    $name: req.body.name,
    $parentId: req.body.parentId
  }, function(err) {
    if (err) {
      next(err);
    }
    res.status(200).send({
      id: this.lastID
    });
  });
});

module.exports = router;
