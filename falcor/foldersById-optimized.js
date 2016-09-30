const falcor = require('falcor');
const Rx = require('rx');
const FolderModelConstructor = require('../folder/folderModel');
const $ref = falcor.Model.ref;

module.exports = db => {
  const Folder = FolderModelConstructor(db);

  return [];

  // return [
  //   // CREATE Folder
  //   {
  //     route: 'foldersById[{keys:ids}].folders.createSubFolder',
  //     call(callPath, args, refPaths, thisPaths) {
  //       const ids = callPath.ids;
  //       const name = args[0].name;

  //       return Rx.Observable.from(ids)
  //         .concatMap(id => {
  //           // create folder
  //           // TODO - how to better create two observables in sequence (second is created only after the first completes) and combine their results
  //           return Folder.create(name, id)
  //             .flatMap(folder => {
  //               // get new count of parent folder's subfolders
  //               return Folder.getSubfolderCount(id)
  //                 .map(data => Object.assign(folder, {parentSubFolderCount: data.count}));
  //             });
  //         })
  //         .map(folder => {
  //           // return pathValue ref linking parentFolder to new folder
  //           // TODO - this assumes the new folder is inserted at the end of the parentFolder.folders list
  //           const folderPathValue = {
  //             path: ['foldersById', folder.parentId, 'folders', folder.parentSubFolderCount -1],
  //             value: $ref(['foldersById', folder.id])
  //           };

  //           // return pathValues for refPaths, if known
  //           // TODO - this doesn't actually prevent a subsequent call to folderById.newFolderId[refPaths]
  //           //        though the equivalent jsonGraphEnvelope does...
  //           const folderFieldPathValues = refPaths
  //             .filter(path => path.length === 1 && ['id', 'name', 'parentId'].indexOf(path[0]) >= 0)
  //             .map(path => path[0])
  //             .map(field => ({
  //               path: ['foldersById', folder.parentId, 'folders', folder.parentSubFolderCount -1, field],
  //               value: folder[field]
  //             }));

  //           return [folderPathValue, ...folderFieldPathValues];

  //           // TODO - thought hardcoded, this does prevent a subsequent call to folderById.newFolderId[refPaths]
  //           // const jsonGraphEnvelope = {
  //           //   jsonGraph: {
  //           //     foldersById: {
  //           //       1: {
  //           //         folders: {
  //           //           length: folder.parentSubFolderCount,
  //           //           3: $ref(['foldersById', 10])
  //           //         }
  //           //       },
  //           //       10: {id: folder.id, parentId: folder.parentId, name: folder.name}
  //           //     }
  //           //   },
  //           //   paths: [
  //           //     ['foldersById', 1, 'folders', 'length'],
  //           //     ['foldersById', 1, 'folders', folder.parentSubFolderCount -1, 'id'],
  //           //     ['foldersById', 1, 'folders', folder.parentSubFolderCount -1, 'parentId'],
  //           //     ['foldersById', 1, 'folders', folder.parentSubFolderCount -1, 'name']
  //           //   ],
  //           //   invalidated: [[]]
  //           // };

  //           // return jsonGraphEnvelope;
  //         });
  //     }
  //   },
  //   // DELETE Folders by ID [explicit]
  //   {
  //     route: "foldersById.delete",
  //     call(callPath, ids) {
  //       // foldersList is treated as an explicit dependency, so invalidation is handled by server
  //       return Folder.deleteByIds(ids)
  //         .reduce((res, id, idx) => {
  //           // set deleted node to null
  //           res.jsonGraph.foldersById[id] = null;
  //           res.paths.push(['foldersById', id]);

  //           // update dependent nodes
  //           res.jsonGraph.foldersList.length = $ref(['foldersList', 'length']);
  //           if (idx === 0) {
  //             res.paths.push(['foldersList', 'length']);
  //           }

  //           // invalidate dependent nodeSets
  //           if (idx === 0) {
  //             // should be able to only invalidate from [id.index..length]
  //             res.invalidated.push(['foldersList', {from: 0}]);
  //           }

  //           return res;
  //         }, {jsonGraph: {foldersById: {}, foldersList: {}}, paths: [], invalidated: []});
  //     }
  //   }
  // ];
};
