const FalcorServer = require('falcor-express');
const Router = require('falcor-router');
const db = require('../db');
const falcor = require('falcor');
const $ref = falcor.Model.ref;
const $error = falcor.Model.error;

const BaseRouter = Router.createClass([
  {
    route: "foldersById[{integers:ids}][{keys:fields}]",
    get(pathSet) {
      return new Promise((resolve, reject) => {
        const ids = pathSet.ids;
        const fields = pathSet.fields;

        db.all(`SELECT ${fields.join(', ')} FROM folder WHERE id IN (${ids.join(', ')})`, [], (err, rows) => {
          if (err) {
            console.error(err);
            return reject({
              path: ['foldersById'],
              value: $error(err.message)
            });
          }

          const pathValues = ids.reduce((pathValues, folderId) => {
            const row = rows.find(row => row.id === folderId);

            if (!row) {
              // folderId doesn't exist
              return pathValues.concat({
                path: ['foldersById', folderId],
                value: null
              });
            }

            // add fields to folder
            return pathValues.concat(fields.map(field => {
              return {
                path: ['foldersById', folderId, field],
                value: row[field]
              };
            }));
          }, []);

          resolve(pathValues);
        });
      });
    }
  },
  {
    route: "folderList[{integers:indices}][{keys:fields}]",
    get(pathSet) {
      return new Promise((resolve, reject) => {
        const indices = pathSet.indices;
        const fields = pathSet.fields;

        db.all(`SELECT ${fields.join(', ')} FROM folder WHERE rowId IN (${indices.join(', ')})`, [], (err, rows) => {
          if (err) {
            console.error(err);
            return reject({
              path: ['folderList'],
              value: $error(err.message)
            });
          }

          const result = [];
          indices.forEach(idx => {
            if (rows[idx]) {
              const folderId = rows[idx]['id'];

              // add ref to foldersById
              result.push({
                path: ['folderList', idx],
                value: $ref(['foldersById', folderId])
              });

              // add fields to folder
              fields.forEach(field => {
                result.push({
                  path: ['foldersById', folderId, field],
                  value: rows[idx][field]
                });
              });
            } else {
              // folder at idx doesn't exist
              result.push({
                path: ['folderList', idx],
                value: null
              })
            }
          });

          resolve(result);
        });
      });
    }
  }
]);

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
