## Falcor SQL Router

Express routes to map falcor requests to SQL queries. Built on SQLite, Express, Falcor, with a simple web client.


### Setup
```bash
npm install
```

## Run Profiles:
* *develop*: initilize an in-memory DB and seed it w/ the seed file `db/sql/seed.sql`
* *test*: initialize an in-memory DB.  Each test group seeds the db with a different test dataset
* *production*: does not intitialize the database
  * If no database exists, initialize and seed with `npm run initDB` and `npm run seedDB`.  Then run via `npm run prod`
  * If the database already exists, simply run via `npm run prod`
  * To reinitialize an already-created production DB, run `npm run reinitDB`

### Develop
To run against an in-memory DB, run
```bash
npm run dev
```

Database is initialized and seeded automatically.

To reinitialize the db, bounce the server.

### Test
If not globally installed, install faucet
```bash
npm install -g tap-summary
```

Then run
```bash
npm run test
```

### Serve
To run against a persistent DB, run
```bash
npm run initDB
npm run seedDB
npm run prod
```

To reinitialize the db, run
```bash
npm run reinitDB
```