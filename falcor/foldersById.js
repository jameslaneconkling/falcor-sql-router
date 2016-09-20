const falcor = require('falcor');
const Rx = require('rx');
const Folder = require('../folder/folderModel');
const $ref = falcor.Model.ref;

module.exports = [
  // GET SET Folders by IDs
  {
    route: "foldersById[{keys:ids}][{keys:fields}]",
    get(pathSet) {
      const foldersSource = Folder.getByIds(pathSet.ids, pathSet.fields);

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

      return Rx.Observable.from(ids)
        .concatMap(id => Folder.setRow(id, folders[id]))
        .map(data => {
          return {
            path: ['foldersById', data.id, data.field],
            value: data.value
          };
        });
    }
  },
  // CREATE Folder
  // TODO - handle refPath and thisPath
  {
    route: 'foldersById[{keys:ids}].createSubFolder',
    call(callPath, args, refPath, thisPath) {
      const ids = callPath.ids;
      const name = args[0];

      return Rx.Observable.from(ids)
        .concatMap(id => Folder.create(name, id))
        .map(data => {
          return {
            path: ['foldersById', data.id, 'id'],
            value: data.id
          };
        });
    }
  },
  // DELETE Folders by ID [implicit]
  // TODO - this route should be foldersById[{keys:ids}].delete
  // TODO - handle refPath and thisPath
  {
    route: "foldersById.delete",
    call(callPath, ids) {
      // foldersList is treated as an implicit dependency, so invalidation must be handled by client
      return Folder.deleteByIds(ids)
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
  //     return Folder.deleteByIds(ids)
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
    route: "foldersById[{keys:parentIds}].folders[{ranges:childRanges}]",
    get(pathSet) {
      const parentIds = pathSet.parentIds;
      const childRanges = pathSet.childRanges;

      return Rx.Observable.from(parentIds)
        .concatMap(parentId => Folder.getSubfoldersByRange(parentId, childRanges))
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
        });
    }
  },
  // GET Subfolders count from base folder
  {
    route: "foldersById[{keys:parentIds}].folders.length",
    get(pathSet) {
      const parentIds = pathSet.parentIds;

      return Rx.Observable.from(parentIds)
        .concatMap(Folder.getSubfolderCount)
        .map(data => {
          // return pathValue count
          return {
            path: ['foldersById', data.parentId, 'folders', 'length'],
            value: data.count
          };
        });
    }
  }
];
