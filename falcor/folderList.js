const falcor = require('falcor');
const Rx = require('rx');
const folderController = require('../folder/folderController');
const db = require('../db');
const $ref = falcor.Model.ref;

module.exports = [
  // DELETE Folders from List
  // {
  //   route: "foldersList.delete",
  //   call(callPath, indices) {

  //   }
  // },
  // GET Folders from folderList by index
  {
    route: "folderList[{ranges:ranges}]",
    get(pathSet) {
      const ranges = pathSet.ranges;

      return folderController.getByRanges(ranges, [])
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
        });
    }
  },
  // GET Folders with fields from folderList by index [optimized]
  {
    route: "folderList[{ranges:ranges}][{keys:fields}]",
    get(pathSet) {
      const ranges = pathSet.ranges;
      const fields = pathSet.fields;

      return folderController.getByRanges(ranges, fields)
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
    }
  },
];