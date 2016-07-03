const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const resourceRouter = require('./rest/routes/resource');
const folderRouter = require('./rest/routes/folder');

app.use(morgan('combined'));
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
