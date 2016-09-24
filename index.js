const db = require('./db')();
const app = require('./app')(db);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
