const port = process.env.PORT || 3000;

let dbConfig;
if (process.env.NODE_ENV === 'production') {
  dbConfig = {
    file: `${__dirname}/db.sql`,
    seed: false
  };
} else if (process.env.NODE_ENV === 'development') {
  dbConfig = {
    file: false,
    seed: `${__dirname}/db/sql/seed.sql`
  };
}

const db = require('./db')(dbConfig);
const app = require('./app')(db);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
