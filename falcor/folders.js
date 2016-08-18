const falcor = require('falcor');
const R = require('ramda');
const Rx = require('rx');
const db = require('../db');
const $ref = falcor.Model.ref;
const $error = falcor.Model.error;

const handleError = (err) => {
  console.error(err);
  return $error(err.message);
};

module.exports = [
  // GET SET Folders by IDs
  {
    route: "foldersById[{keys:ids}][{keys:fields}]",
    get(pathSet) {
      console.log(JSON.stringify(pathSet));
      const ids = pathSet.ids;
      const fields = pathSet.fields;

      // * emit query by row
      // * catch db query error
      // * convert missing rows into null pathValue
      // * break rows down into fields and convert each into a pathValue
      return Rx.Observable.create(observer => {
        db.all(`SELECT id, ${fields.join(', ')} FROM folder WHERE id IN (${ids.join(', ')})`, [], (err, rows) => {
          if (err) {
            observer.onError(err);
          } else {
            ids.forEach(id => {
              observer.onNext({
                id,
                row: rows.find(row => row.id === id)
              });
            });
            observer.onCompleted();
          }
        });
      })
        .reduce((accumulator, data) => {
          if (!data.row) {
            const missingRowPathValue = {
              path: ['foldersById', data.id],
              value: null
            };
            return [...accumulator, missingRowPathValue];
          }

          const pathValuesByField = fields.map(field => ({
            path: ['foldersById', data.id, field],
            value: data.row[field]
          }));
          return [...accumulator, ...pathValuesByField];
        }, [])
        .catch(handleError)
    },
    set(jsonGraph) {
      const folders = jsonGraph.foldersById;
      const ids = Object.keys(folders);
      // ASSUMPTION: all nodes are updating same properties
      const fields = folders[ids[0]];

      const updateRow = (id, fields) => {
        return Rx.Observable.create(observer => {
          const fieldsKeys = Object.keys(fields);
          const setQuery = fieldsKeys.map(field => `${field} = '${fields[field]}'`);

          db.run(`UPDATE folder SET ${setQuery.join(', ')} WHERE id = ${id}`, [], function(err) {
            if (err) {
              observer.onError(err);
            } else {
              fieldsKeys.forEach(key => {
                observer.onNext({
                  id,
                  field: key,
                  value: fields[key]
                });
              });
              observer.onCompleted();
            }
          });
        });
      };

      return Rx.Observable.from(ids)
        .concatMap(id => updateRow(id, folders[id]))
        .map(data => {
          return {
            path: ['foldersById', data.id, data.field],
            value: data.value
          };
        })
        .catch(handleError);
    }
  },
  // DELETE Folders by ID
  {
    route: "foldersById.delete",
    call(callPath, ids) {
      return Rx.Observable.create(observer => {
        db.run(`DELETE FROM folder WHERE id IN (${ids.join(', ')})`, [], (err, rows) => {
          if (err) {
            observer.onError(err);
          } else {
            ids.forEach(id => observer.onNext(id));
            observer.onCompleted();
          }
        });
      })
        // .map(id => {
        //   // foldersList is treated as an implicit dependency, so invalidation must be handled by client
        //   return {
        //     path: ['foldersById', id],
        //     value: null
        //   };
        // })
        .reduce((res, id, idx) => {
          // foldersList is treated as an explicit dependency, so invalidation is handled by server

          // set deleted node to null
          res.jsonGraph.foldersById[id] = null;
          res.paths.push(['foldersById', id]);

          // update dependent nodes
          res.jsonGraph.foldersList.length -= 1;
          if (idx === 0) {
            res.paths.push(['foldersList', 'length']);
          }

          // invalidate dependent nodeSets
          if (idx === 0) {
            // should be able to only invalidate from [id.index..length]
            res.invalidated.push(['foldersList', {from: 0}]);
          }

          return res;
        }, {jsonGraph: {foldersById: {}, foldersList: {}}, paths: [], invalidated: []})
        .catch(handleError)
    }
  },
  // DELETE Folders from List
  // {
  //   route: "foldersList.delete",
  //   call(callPath, indices) {

  //   }
  // },
  // GET Folders from folderList by index
  {
    route: "folderList[{integers:indices}]",
    get(pathSet) {
      console.log(JSON.stringify(pathSet));
      const indices = pathSet.indices;
      const fields = pathSet.fields;

      return Rx.Observable.create(observer => {
        // node-sqlite only returns ROWID if it's aliased as something else
        db.all(`SELECT ROWID as rowid, id FROM folder WHERE rowid IN (${indices.join(', ')})`, [], (err, rows) => {
          if (err) {
            observer.onError(err);
          } else {
            indices.forEach(idx => {
              observer.onNext({
                idx,
                row: rows.find(row => row.rowid === idx)
              });
            });
            observer.onCompleted();
          }
        });
      })
        .map(data => {
          // if row doesn't exist, return null pathValue
          if (!data.row) {
            return {
              path: ['folderList', data.idx],
              value: null
            };
          }

          // return pathValue ref to folder
          return {
            path: ['folderList', data.idx],
            value: $ref(['foldersById', data.row.id])
          };
        })
        .catch(handleError);
    }
  },
  // GET Folders Length
  {
    route: "folderList.length",
    get(pathSet) {
      console.log(JSON.stringify(pathSet));

      return Rx.Observable.create(observer => {
        db.all(`SELECT count(*) as count FROM folder`, [], (err, rows) => {
          if (err) {
            observer.onError(err);
          } else {
            observer.onNext(rows[0]);
            observer.onCompleted();
          }
        });
      })
        .map(data => {
          // return pathValue count
          return {
            path: ['folderList', 'length'],
            value: data.count
          };
        })
        .catch(handleError);
    }
  },
  // GET Folders with fields from folderList by index [optimized]
  {
    route: "folderList[{integers:indices}][{keys:fields}]",
    get(pathSet) {
      console.log(JSON.stringify(pathSet));
      const indices = pathSet.indices;
      const fields = pathSet.fields;

      return Rx.Observable.create(observer => {
        // node-sqlite only returns ROWID if it's aliased as something else
        db.all(`SELECT ROWID as rowid, id, ${fields.join(', ')} FROM folder WHERE rowid IN (${indices.join(', ')})`, [], (err, rows) => {
          if (err) {
            observer.onError(err);
          } else {
            indices.forEach(idx => {
              observer.onNext({
                idx,
                row: rows.find(row => row.rowid === idx)
              });
            });
            observer.onCompleted();
          }
        });
      })
        .reduce((accumulator, data) => {
          // if row doesn't exist, return null pathValue
          if (!data.row) {
            const missingRowPathValue = {
              path: ['folderList', data.idx],
              value: null
            };
            return [...accumulator, missingRowPathValue];
          }

          // return pathValue ref to folder
          const pathValueRef = {
            path: ['folderList', data.idx],
            value: $ref(['foldersById', data.row.id])
          };

          // return fields by pathValue
          const pathValuesByField = fields.map(field => ({
            path: ['foldersById', data.row.id, field],
            value: data.row[field]
          }));

          return [...accumulator, pathValueRef, ...pathValuesByField];
        }, [])
        .catch(handleError);
    }
  },
  // GET Subfolders from folders
  {
    route: "foldersById[{keys:parentIds}].folders[{integers:indices}]",
    get(pathSet) {
      console.log(JSON.stringify(pathSet));
      const parentIds = pathSet.parentIds;
      const indices = pathSet.indices;

      // TODO - b/c sqlite doesn't support window functions, this queries the db separately...
      const getFolderSubfolders = (childIndices, parentId) => {
        return Rx.Observable.create(observer => {
          // NOTE: this is terribly inefficient - grabs all rows up to the
          db.all(`SELECT child.id as id, child.parentId as parentId
                  FROM (SELECT * FROM folder WHERE id = ${parentId}) as parent
                  JOIN folder as child
                  ON parent.id = child.parentId
                  LIMIT ${indices[indices.length -1]} OFFSET ${indices[indices[0]]}`, [], (err, rows) => {
            if (err) {
              observer.onError(err);
            } else {
              childIndices.forEach(idx => {
                observer.onNext({
                  idx,
                  parentId,
                  row: rows[idx]
                });
              });
              observer.onCompleted();
            }
          });
        })
      };

      return Rx.Observable.from(parentIds)
        .concatMap(R.curry(getFolderSubfolders)(indices))
        .map(data => {
          // if row doesn't exist, return null pathValue
          if (!data.row) {
            return {
              path: ['foldersById', data.parentId, 'folders', data.idx],
              value: null
            };
          }

          // return pathValue ref to folder
          return {
            path: ['foldersById', data.row.parentId, 'folders', data.idx],
            value: $ref(['foldersById', data.row.id])
          };
        })
        .catch(handleError);
    }
  },
  // GET Subfolders count from base folder
  {
    route: "foldersById[{keys:parentIds}].folders.length",
    get(pathSet) {
      console.log(pathSet);
      const parentIds = pathSet.parentIds;

      const getFolderSubfolderCount = (parentId) => {
        return Rx.Observable.create(observer => {
          // NOTE: this is terribly inefficient - grabs all rows up to the
          db.all(`SELECT count(*) as count
                  FROM (SELECT * FROM folder WHERE id = ${parentId}) as parent
                  JOIN folder as child
                  ON parent.id = child.parentId`, [], (err, rows) => {
            if (err) {
              observer.onError(err);
            } else {
              observer.onNext({
                parentId,
                count: rows[0].count
              });
              observer.onCompleted();
            }
          });
        })
      };

      return Rx.Observable.from(parentIds)
        .concatMap(getFolderSubfolderCount)
        .map(data => {
          // return pathValue count
          return {
            path: ['foldersById', data.parentId, 'folders', 'length'],
            value: data.count
          };
        })
        .catch(handleError);
    }
  }
];
