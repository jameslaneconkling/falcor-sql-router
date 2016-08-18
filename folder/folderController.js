const Rx = require('rx');
const R = require('ramda');
const db = require('../db');

falcorRange2List = range => R.range(range.from, range.to + 1);

/**
 * Get folders by id
 * 
 * returns an observable that emits an object for each id requested
 * each emitted object has:
 * - an id key
 * - a row key pointing at a map of fieldName:rowValue pairs, or if id doesn't exist, pointing at null
 * 
 * {
 *   id: 1,
 *   row: {name: 'Herman Cain', email: 'hcain@verizon.net'}
 * } 
 * 
 * @param {String} ids
 * @param {Array} fields
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

/**
 * Get folders from list by range
 * 
 * returns an observable that emits an object for each index in range
 * each emitted object has:
 * - an idx key representing the index w/i the list
 * - a row key pointing to a map of fieldName:rowValue pairs, or if nothing exists at index, pointing at null
 * 
 * {
 *   idx: 1,
 *   row: {name: 'Herman Cain', email: 'hcain@verizon.net'}
 * } 
 * 
 * @param {Object} range
 * @param {Array} fields
 * @return {Observable}
 */
exports.getByRange = (range, fields) => {
  return Rx.Observable.create(observer => {
    db.all(`SELECT id, ${fields.join(', ')} FROM folder LIMIT ${range.to - range.from + 1} OFFSET ${range.from - 1}`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }
    
      falcorRange2List(range).forEach((rangeIndex, idx) => {
        observer.onNext({
          idx: rangeIndex,
          row: rows[idx]
        });
      });

      observer.onCompleted();
    });
  });
};

/**
 * Get folders from list by multiple ranges
 * 
 * see getByRange()
 * 
 * @param {Array} ranges
 * @param {Array} fields
 * @return {Observable}
 */
exports.getByRanges = (ranges, fields) => {
  const folderListSources = ranges.map(range => {
    return exports.getByRange(range, fields);
  });

  return Rx.Observable.merge(...folderListSources);
};
