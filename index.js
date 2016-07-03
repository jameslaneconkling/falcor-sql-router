const app = require('express')();
const bodyParser = require('body-parser')

const resourceRouter = require('./server/routes/resource');
const folderRouter = require('./server/routes/folder');

app.use(bodyParser.json());

app.use('/api/resource', resourceRouter);
app.use('/api/folder', folderRouter);

app.use((err, req, res, next) => {
  res.status(500).send({
    name: err.name,
    message: err.message,
    stack: err.stack
  });
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});

module.exports = app;
