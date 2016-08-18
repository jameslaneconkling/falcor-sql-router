const Rx = require('rx');
const db = require('../db');

exports.getByIndices = indices => {

};

/**
 * Get folders by id
 * 
 * returns an observable that emits an object for each id requested
 * each emitted object has an id key and a row key
 * if id doesn't exist, row is undefined; otherwise it is an object of fieldName:rowValue pairs
 * 
 * {
 *   id: 1,
 *   row: {name: 'Herman Cain', email: 'hcain@verizon.net'}
 * } 
 * 
 * @param {String} ids
 * @return {Observable}
 */
exports.getByIds = (ids, fields) => {
  return Rx.Observable.create(observer => {
    db.all(`SELECT id, ${fields.join(', ')} FROM folder WHERE id IN (${ids.join(', ')})`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      ids.forEach(id => {
        observer.onNext({
          id,
          row: rows.find(row => row.id === id)
        });
      });
      
      observer.onCompleted();
    });
  });
};