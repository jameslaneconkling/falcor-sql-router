const router = require('express').Router();
const db = require('../../db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM resource LIMIT 10', [], (err, rows) => {
    if (err) {
      next(err);
    }
    res.status(200).send(rows);
  });
});

router.post('/', (req, res, next) => {
  db.run(`INSERT INTO folder
    (name, body, folderId)
    VALUES
    ($name, $body, $folderId)
  `, {
    $name: req.body.name,
    $body: req.body.body,
    $folderId: req.body.folderId
  }, function(err) {
    if (err) {
      console.error(err);
      res.status(500).send()
    }
    res.status(200).send({
      id: this.lastID
    });
  });
});

module.exports = router;
