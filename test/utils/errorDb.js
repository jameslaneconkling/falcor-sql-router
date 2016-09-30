module.exports = class ErrorDB {
  constructor(db, error=true) {
    this.db = db;
    this.error = error;
  }

  run(query, bindings, callback = () => {}) {
    this.callDB('run', arguments);
    if (this.error) {
      this.invokeErrorCallback(callback);
    } else {
      this.db.run(query, bindings, callback);
    }
  }

  get(query, bindings, callback = () => {}) {
    this.callDB('get', arguments);
  }

  all(query, bindings, callback = () => {}) {
    this.callDB('all', arguments);
  }

  each(query, bindings, callback = () => {}, complete = () => {}) {
    this.callDB('each', arguments);
    complete();
  }

  callDB(method, ...args) {
    if (this.error) {
      callback(new Error('You Must Construct Additional Pylons'), null);
    } else {
      this.db[method].apply(this.db, args);
    }
  }

  error() {
    return new ErrorDB(this.db, true);
  }

  succeed() {
    return new ErrorDB(this.db, false);
  }
};