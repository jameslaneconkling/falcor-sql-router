const Rx = require('rx');
const R = require('ramda');
const db = require('../db');

range2List = range => R.range(range.from, range.to + 1);

range2LimitOffset = range => ({limit: range.to - range.from + 1, offset: range.from - 1});

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
    const {limit, offset} = range2LimitOffset(range);

    db.all(`SELECT id, ${fields.join(', ')} FROM folder LIMIT ${limit} OFFSET ${offset}`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      range2List(range).forEach((rangeIndex, idx) => {
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
  return Rx.Observable.from(ranges)
    .concatMap(range => exports.getByRange(range, fields));
};

/**
 * CREATE folder
 */
exports.create = (name, parentId) => {
  return Rx.Observable.create(observer => {
    db.run(`INSERT INTO folder (name, parentId) VALUES (${name}, ${parentId})`, [], (err) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      observer.onNext({id: this.lastID, name, parentId});
      observer.onCompleted();
    });
  });
};

/**
 * Delete folders by id
 *
 * @param {Array} ids
 * @return {Observable}
 */
exports.deleteByIds = (ids) => {
  return Rx.Observable.create(observer => {
    db.run(`DELETE FROM folder WHERE id IN (${ids.join(', ')})`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      ids.forEach(id => observer.onNext(id));
      observer.onCompleted();
    });
  });
};

/**
 * GET folder count
 *
 * @return {Observable}
 */
exports.getCount = () => {
  return Rx.Observable.create(observer => {
    db.get(`SELECT count(*) as count FROM folder`, [], (err, row) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      observer.onNext(row.count);
      observer.onCompleted();
    });
  });
};

/**
 * SET folder props
 *
 * @param {String} id
 * @param {Array} fields
 * @return {Observable}
 */
exports.setRow = (id, fields) => {
  return Rx.Observable.create(observer => {
    const fieldsKeys = Object.keys(fields);
    const setQuery = fieldsKeys.map(field => `${field} = '${fields[field]}'`);

    // TODO - don't convert null to "null"

    db.run(`UPDATE folder SET ${setQuery.join(', ')} WHERE id = ${id}`, [], function(err) {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      fieldsKeys.forEach(key => {
        observer.onNext({
          id,
          field: key,
          value: fields[key]
        });
      });

      observer.onCompleted();
    });
  });
};

/**
 * GET subfolders by range
 *
 * @param {String} parentId
 * @param {Object} range
 * @return {Observable}
 */
exports.getSubfoldersByRange = (parentId, range) => {
  return Rx.Observable.create(observer => {
    const {limit, offset} = range2LimitOffset(range);

    db.all(`SELECT child.id as id, child.parentId as parentId
            FROM (SELECT * FROM folder WHERE id = ${parentId}) as parent
            JOIN folder as child
            ON parent.id = child.parentId
            LIMIT ${limit} OFFSET ${offset}`, [], (err, rows) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      range2List(range).forEach(idx => {
        observer.onNext({
          idx,
          parentId,
          row: rows[idx]
        });
      });

      observer.onCompleted();
    });
  });
};

/**
 * GET Subfolders by ranges
 *
 * @param {String} parentId
 * @param {Array} ranges
 * @return {Observable}
 */
exports.getSubfoldersByRanges = (parentId, ranges) => {
  return Rx.Observable.from(ranges)
    .concatMap(range => exports.getSubfoldersByRange(parentId, range));
};

/**
 * GET Subfolder count
 *
 * @param {String} parentId
 * @return {Observable}
 */
exports.getSubfolderCount = (parentId) => {
  return Rx.Observable.create(observer => {
    db.get(`SELECT count(*) FROM folder WHERE parentId = ${parentId}`, [], (err, row) => {
      if (err) {
        console.error(err);
        return observer.onError(err);
      }

      observer.onNext({
        parentId,
        count: row.count
      });

      observer.onCompleted();
    });
  });
};
