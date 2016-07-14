const FalcorServer = require('falcor-express');
const Router = require('falcor-router');
const falcor = require('falcor');
const Rx = require('rx');
const db = require('../db');
const $ref = falcor.Model.ref;
const $error = falcor.Model.error;

const BaseRouter = Router.createClass([
  // GET Folder by IDs
  {
    route: "foldersById[{keys:ids}][{keys:fields}]",
    get(pathSet) {
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
        .catch(err => {
          console.error(err);
          return Rx.Observable.throw({
            path: ['foldersById'],
            value: $error(err.message)
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
        }, []);
    }
  },
  // GET Folder from folderList by index
  {
    route: "folderList[{integers:indices}][{keys:fields}]",
    get(pathSet) {
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
        .catch(err => {
          console.error(err);
          return Rx.Observable.throw({
            path: ['folderList'],
            value: $error(err.message)
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
        }, []);
    }
  }
]);
  // {
  //   route: "foldersById[{keys:parentIds}].contains[{integers:indices}][{keys:childFields}]",
  //   get(pathSet) {
  //     return Rx.Observable.create(observer => {
  //       const parentIds = pathSet.parentIds;
  //       const indices = pathSet.indices;
  //       const childFields = pathSet.childFields;

  //       // NOTE: does not limit number of children per parent folder.  would need to GROUP BY parent.id and subselect by rowid?
  //       //       also does not allow for fields on the parent...
  //       //       also, need to make sure child order is consistent?  ORDER BY rowid?
  //       db.all(`SELECT ${childFields.map(f => `child.${f}`).join(', ')}
  //               FROM (SELECT * FROM folder WHERE id IN (${parentIds.join(', ')})) as parent
  //               JOIN folder as child
  //               ON parent.id = child.parentId`, [], (err, rows) => {
  //         if (err) {
  //           console.error(err);
  //           observer.onError({
  //             path: ['foldersById'],
  //             value: $error(err.message)
  //           });
  //           return;
  //         }

  //         parentIds.forEach(parentId => {
  //           const parentIdsChildren = rows.filter(row => row['child.parentId'] === parentId);

  //           if (parentIdsChildren.length === 0) {
  //             // parentIdFolder doesn't have children
  //             observer.onNext({
  //               path: ['foldersById', parentId, 'contains'],
  //               value: null // should be []?  But router resolves [] incorrectly
  //             });
  //           } else {
  //             parentIdsChildren.forEach((child, idx) => {
  //               const childId = child['child.id'];

  //               // add ref to folderById
  //               observer.onNext({
  //                 path: ['foldersById', parentId, 'contains', idx],
  //                 value: $ref(['foldersById', childId])
  //               });

  //               // add fields to folder
  //               // NOTE: should be able to abstract adding multiple fields via many PathValues
  //               //       if only there was a PathSetValues type: that represents all values within one pathSet...
  //               childFields.forEach(field => {
  //                 observer.onNext({
  //                   path: ['foldersById', childId, field],
  //                   value: child[`child.${field}`]
  //                 });
  //               });
  //             });
  //           }
  //         });

  //         observer.onCompleted();
  //       });
  //     });
  //   }
  // },
// ]);

// To subclass:
// const SubRouter = function(prop) {
//   BaseRouter.call(this);
//   this.prop = prop;
// };
//
// SubRouter.prototype = Object.create(BaseRouter.prototype);

module.exports = FalcorServer.dataSourceRoute((req, res) => {
  res.type('json');
  return new BaseRouter();

  // mock
  // return new falcor.Model({
  //   cache: {
  //     foldersById: {
  //       1: {
  //         name: 'folder1',
  //       },
  //       2: {
  //         name: 'folder2',
  //       }
  //     }
  //   }
  // }).asDataSource();
});
