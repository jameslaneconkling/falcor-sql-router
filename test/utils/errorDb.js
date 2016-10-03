module.exports = class ErrorDB {
  constructor(db, error=true) {
    this.db = db;
    this.error = error;
  }

  run(query, bindings, callback = () => {}) {
    this.callDB('run', arguments, callback);
  }

  get(query, bindings, callback = () => {}) {
    this.callDB('get', arguments, callback);
  }

  all(query, bindings, callback = () => {}) {
    this.callDB('all', arguments, callback);
  }

  each(query, bindings, callback = () => {}, complete = () => {}) {
    this.callDB('each', arguments, callback, complete);
  }

  callDB(method, ...args) {
    if (this.error) {
      args[0](new Error('You Must Construct Additional Pylons'), null);
    } else {
      this.db[method].apply(this.db, ...args);
    }
  }

  error() {
    return new ErrorDB(this.db, true);
  }

  succeed() {
    return new ErrorDB(this.db, false);
  }
};