// const falcor = require('falcor');
// const Rx = require('rx');
// // const FolderModelConstructor = require('../folder/folderModel');
// const $ref = falcor.Model.ref;

// module.exports = db => {
//   const Folder = FolderModelConstructor(db);

//   return [
//     // GET SET Folders by IDs
//     // TODO can both lists (entities or entityList) and maps (entity or entityById) be a collection?
//     //      and if so, how to know if the following path is a range or a key list?
//     {
//       route: "[{keys:mapCollections}][{keys:ids}][{keys:predicates}]",
//       get(pathSet) {
//         const entitySource = Model.fromCollection(pathSet.mapCollections)
//           .flatMap(collection => Model.getByIds(collection, pathSet.ids, pathSet.predicates))

//         // convert missing rows into null pathValue
//         const nullPathValues = entitySource
//           .filter(data => !data.row)
//           .map(data => ({
//             path: [data.collection, data.id],
//             value: null
//           }));

//         // break rows down into predicates and convert each into a pathValue
//         const pathValues = entitySource
//           .filter(data => data.row)
//           .reduce((accumulator, data) => {
//             const pathValuesByPredicate = Object.keys(data.row).map(predicate => ({
//               path: [data.collection, data.id, predicate],
//               value: data.row[predicate]
//             }));

//             return [...accumulator, ...pathValuesByPredicate];
//           }, []);

//         return Rx.Observable.merge(nullPathValues, pathValues);
//       },
//       set(jsonGraph) {
//         const collections = Object.keys(jsonGraph);

//         return Model.fromCollection(collections)
//           .flatMap(collection => {

//           });
//         const ids = Object.keys(folders);

//         return Rx.Observable.from(ids)
//           .concatMap(id => Folder.setRow(id, folders[id]))
//           .map(data => {
//             return {
//               path: ['foldersById', data.id, data.field],
//               value: data.value
//             };
//           });
//       }
//     },
//     // GET Subfolders from folders
//     {
//       route: "[list.{keys:listCollections}][{ranges:indices}][{keys:predicates}]",
//       get(pathSet) {
//         const entitySource = Model.fromCollection(pathSet.listCollections)
//           .flatMap(collection => Model.getByRange(collection, pathSet.indices, pathSet.predicates))

//         // convert missing rows into null pathValue
//         const nullPathValues = entitySource
//           .filter(data => !data.row)
//           .map(data => ({
//             path: [data.collection, data.idx],
//             value: null
//           }));

//         // break rows down into predicates and convert each into a pathValue
//         const pathValues = entitySource
//           .filter(data => data.row)
//           .reduce((accumulator, data) => {
//             const pathValuesByPredicate = Object.keys(data.row).map(predicate => ({
//               path: [data.collection, data.idx, predicate],
//               value: data.row[predicate]
//             }));

//             return [...accumulator, ...pathValuesByPredicate];
//           }, []);

//         return Rx.Observable.merge(nullPathValues, pathValues);
//       },
//       set(jsonGraph) {
//         const collections = Object.keys(jsonGraph);

//         return Model.fromCollection(collections)
//           .flatMap(collection => {

//           });
//         const ids = Object.keys(folders);

//         return Rx.Observable.from(ids)
//           .concatMap(id => Folder.setRow(id, folders[id]))
//           .map(data => {
//             return {
//               path: ['foldersById', data.id, data.field],
//               value: data.value
//             };
//           });
//       }
//     }
//   ];
// };
