## Falcor SQL Router

Express routes to map falcor requests to SQL queries. Built on SQLite, Express, Falcor, with a simple web client.

### Setup
```bash
npm install
```

### Develop
To run against an in-memory DB, run
```bash
npm run dev
```

Database is initialized and seeded automatically.

To reinitialize the db, bounce the server.

### Serve
To run against a persistent DB, run 
```bash
npm run initDB
npm run seedDB
npm run prod
```

To reinitialize the db, bounce the server.
```bash
npm run reinitDB
```