// const falcor = require('falcor');
// const Folder = require('../folder/folderModel');
// const {
//   range2List,
// } = require('../utils/falcor');
// const $ref = falcor.Model.ref;

// module.exports = db => {
//   return [];

  // NOTE - this won't work until folderList[{ranges:ranges}].folders[{ranges:childRanges}] works
  // return [
  //   // GET Folders with fields from folderList by index [optimized]
  //   {
  //     route: "folderList[{ranges:ranges}][{keys:fields}]",
  //     get(pathSet) {
  //       const ranges = pathSet.ranges;
  //       const fields = pathSet.fields;

  //       return Folder.getByRanges(ranges, fields)
  //         .reduce((accumulator, data) => {
  //           // if row doesn't exist, return null pathValue
  //           if (!data.row) {
  //             const missingRowPathValue = {
  //               path: ['folderList', data.idx],
  //               value: null
  //             };
  //             return [...accumulator, missingRowPathValue];
  //           }

  //           // return pathValue ref to folder
  //           const pathValueRef = {
  //             path: ['folderList', data.idx],
  //             value: $ref(['foldersById', data.row.id])
  //           };

  //           // return fields by pathValue
  //           const pathValuesByField = fields.map(field => ({
  //             path: ['foldersById', data.row.id, field],
  //             value: data.row[field]
  //           }));

  //           return [...accumulator, pathValueRef, ...pathValuesByField];
  //         }, []);
  //     }
  //   },
  //   // GET Folders with subfolders from folderList by index [optimized]
  //   // NOTE - this is kind of a silly route: given that folders are recursively nested, you likely don't want to access them from the flattened folderList
  //   //        it also wouldn't be necessary if the optimized folderList[{ranges:ranges}][{keys:fields}] didn't exist,
  //   //        as the more naive folderList[{ranges:ranges}] would create refs to foldersById before the fields for each folder are resolved
  //   //        lesson: when optimizing a field query on a collection route, also add routes for relationships, or else they will be evaluated as fields
  //   {
  //     route: "folderList[{ranges:ranges}].folders[{ranges:childRanges}]",
  //     get(pathSet) {
  //       const ranges = pathSet.ranges;
  //       const childRanges = pathSet.childRanges;

  //       // TODO - this isn't being subscribed to?
  //       return Rx.Observable.from(childRanges)
  //         .concatMap(childRange => Folder.getByRanges(ranges))
  //         .map(data => {
  //           // if row doesn't exist, return null pathValue
  //           if (!data.row) {
  //             return {
  //               path: ['folderList', data.idx],
  //               value: null
  //             };
  //           }

  //           // return pathValue ref to folder's childRange
  //           return {
  //             path: ['folderList', data.idx, 'folders', childRange],
  //             value: $ref(['foldersById', data.row.id, 'folders', childRange])
  //           };
  //         });
  //     }
  //   }
  // ];
// };
