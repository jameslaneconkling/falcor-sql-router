const test = require('tape');
const dbConstructor = require('../db');
const appConstructor = require('../app');
const {
  runTest
} = require('./test-utils');

module.exports = () => {
  // TODO - these probably need callbacks to ensure they complete before tests run
  // TODO - import/build client falcor parsing lib to recreate response
  const db = dbConstructor({
    file: false,
    seed: `${__dirname}/../db/sql/seed.sql`
  });
  const app = appConstructor(db);


  test('folderList: Should return folders from beginning of list', assert => {
    const method = 'get';
    const paths = [
      ["folderList", {"to": 1}, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          0: { $type: "ref", value: [ "foldersById", 1 ] },
          1: { $type: "ref", value: [ "foldersById", 2 ] }
        },
        foldersById: {
          1: {
            id: 1,
            name: "root folder",
            parentId: null
          },
          2: {
            id: 2,
            name: "folder1",
            parentId: 1
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('folderList: should return non-continguous folders from middle of list', assert => {
    const method = 'get';
    const paths = [
      ["folderList", [{"from":2, "to":3}, 5], ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          2: { $type: "ref", value: [ "foldersById", 3 ] },
          3: { $type: "ref", value: [ "foldersById", 4 ] },
          5: { $type: "ref", value: [ "foldersById", 6 ] }
        },
        foldersById: {
          3: {
            id: 3,
            name: "folder2",
            parentId: 1
          },
          4: {
            id: 4,
            name: "folder3",
            parentId: 1
          },
          6: {
            id: 6,
            name: "folder1.2",
            parentId: 2
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('folderList: Should return null for folders that do not exist', assert => {
    const method = 'get';
    const paths = [
      ["folderList", 100, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          100: null
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('folderList: Should return folder count', assert => {
    const method = 'get';
    const paths = [
      ["folderList", "length"]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          length: 9
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('folderList: Should return folder with subfolders', assert => {
    const method = 'get';
    const paths = [
      ["folderList", 0, "name"],
      ["folderList", 0, "folders", {"to": 1}, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "folderList": {
          "0": { "$type": "ref", "value": ["foldersById", 1] }
        },
        "foldersById": {
          "1": {
            "folders": {
              "0": { "$type": "ref", "value": ["foldersById", 2] },
              "1": { "$type": "ref", "value": ["foldersById", 3] }
            },
            "name": "root folder",
            "id": 1
          },
          "2": {
            "id": 2,
            "name": "folder1",
            "parentId": 1
          },
          "3": {
            "id": 3,
            "name": "folder2",
            "parentId": 1
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('folderList: Should update folder name', assert => {
    const method = 'set';
    const paths = [
      ["folderList", 1, "folder1 edit1"]
    ];
    const expectedResponse = {};

    assert.fail('todo');
    assert.end();
  });


  test('folderList: Should delete folder', assert => {
    assert.fail('todo');
    assert.end();
  });


  test('folderList: Should create new folder', assert => {
    assert.fail('todo');
    assert.end();
  });
};
