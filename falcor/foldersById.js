const falcor = require('falcor');
const R = require('ramda');
const Rx = require('rx');
const folderController = require('../folder/folderController');
const db = require('../db');
const $ref = falcor.Model.ref;

module.exports = [
  // GET SET Folders by IDs
  {
    route: "foldersById[{keys:ids}][{keys:fields}]",
    get(pathSet) {
      const foldersSource = folderController.getByIds(pathSet.ids, pathSet.fields);
      
      // convert missing rows into null pathValue
      const nullPathValues = foldersSource
        .filter(data => !data.row)
        .map(data => ({
          path: ['foldersById', data.id],
          value: null
        }));

      // break rows down into fields and convert each into a pathValue
      const pathValues = foldersSource
        .filter(data => data.row)
        .reduce((accumulator, data) => {
          const pathValuesByField = Object.keys(data.row).map(field => ({
            path: ['foldersById', data.id, field],
            value: data.row[field]
          }));

          return [...accumulator, ...pathValuesByField];
        }, []);

      return Rx.Observable.merge(nullPathValues, pathValues);
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

    }
  },
  // DELETE Folders by ID [implicit]
  {
    route: "foldersById.delete",
    call(callPath, ids) {
      // foldersList is treated as an implicit dependency, so invalidation must be handled by client
      return folderController.deleteFoldersById(ids)
        .map(id => ({
          path: ['foldersById', id],
          value: null
        }));
    }
  },
  // DELETE Folders by ID [explicit]
  // {
  //   route: "foldersById.delete",
  //   call(callPath, ids) {
  //     // foldersList is treated as an explicit dependency, so invalidation is handled by server
  //     return folderController.deleteFoldersById(ids)
  //       .reduce((res, id, idx) => {
  //         // set deleted node to null
  //         res.jsonGraph.foldersById[id] = null;
  //         res.paths.push(['foldersById', id]);

  //         // update dependent nodes
  //         res.jsonGraph.foldersList.length = $ref(['foldersList', 'length']);
  //         if (idx === 0) {
  //           res.paths.push(['foldersList', 'length']);
  //         }

  //         // invalidate dependent nodeSets
  //         if (idx === 0) {
  //           // should be able to only invalidate from [id.index..length]
  //           res.invalidated.push(['foldersList', {from: 0}]);
  //         }

  //         return res;
  //       }, {jsonGraph: {foldersById: {}, foldersList: {}}, paths: [], invalidated: []})

  //   }
  // },
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

    }
  }
];