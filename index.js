const app = require('express')();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
// Middleware
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Static client files
// app.use(express.static(__dirname + '/public'));

// REST endpoints
app.use('/api/resource', require('./rest/routes/resource'));
app.use('/api/folder', require('./rest/routes/folder'));

// Falcor endpoint
app.use('/api/model.json', require('./falcor/server'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error on:', req, err);
  res.status(500).send({
    name: err.name,
    message: err.message,
    stack: err.stack
  });
});

// Boot
app.listen(3000, () => {
  console.log('listening on port 3000');
});

module.exports = app;
