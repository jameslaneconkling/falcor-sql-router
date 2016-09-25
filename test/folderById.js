const test = require('tape');
const dbConstructor = require('../db');
const appConstructor = require('../app');
const {
  runTest
} = require('./test-utils');


module.exports = () => {
  const db = dbConstructor();
  const app = appConstructor(db);

  test('foldersById: setup', assert => {
    require('../db/seed')(db, err => {
      if (err) {
        assert.fail(err);
      }
      assert.end();
    });
  });


  test('foldersById: Should return folders with ID 1, 3, and 4', assert => {
    const method = 'get';
    const paths = [
      ["foldersById", [1, 3, 4], ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "foldersById": {
          "1": {
            "id": 1,
            "name": "root folder",
            "parentId": null
          },
          "3": {
            "id": 3,
            "name": "folder2",
            "parentId": 1
          },
          "4": {
            "id": 4,
            "name": "folder3",
            "parentId": 1
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('foldersById: Should return null for folder that doesn\'t exist', assert => {
    const method = 'get';
    const paths = [
      ["foldersById", "nope", ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "foldersById": {
          "nope": null
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('foldersById: Should return folder with subfolders', assert => {
    const method = 'get';
    const paths = [
      ["foldersById", [1, 2], "name"],
      ["foldersById", [1, 2], "folders", {"to":2}, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "foldersById": {
          "1": {
            "name": "root folder",
            "id": 1,
            "folders": {
              "0": { "$type": "ref", "value": [ "foldersById", 2] },
              "1": { "$type": "ref", "value": [ "foldersById", 3] }
            }
          },
          "2": {
            "name": "folder1",
            "id": 2,
            "parentId": 1,
            "folders": {
              "0": { "$type": "ref", "value": [ "foldersById", 5] },
              "1": { "$type": "ref", "value": [ "foldersById", 6] }
            }
          },
          "3": {
            "id": 3,
            "name": "folder2",
            "parentId": 1
          },
          "5": {
            "id": 5,
            "name": "folder1.1",
            "parentId": 2
          },
          "6": {
            "id": 6,
            "name": "folder1.2",
            "parentId": 2
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });


  test('foldersById: Should return folder with subfolder count', assert => {
    const method = 'get';
    const paths = [
      ["foldersById",[2, 3, 4], "name"],
      ["foldersById",[2, 3, 4], "folders", "length"]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "foldersById": {
          "2": {
            "name": "folder1",
            "id": 2,
            "folders": {
              "length": 2
            }
          },
          "3": {
            "name": "folder2",
            "id": 3,
            "folders": {
              "length": 2
            }
          },
          "4": {
            "name": "folder3",
            "id": 4,
            "folders": {
              "length": 1
            }
          }
        }
      }
    };

    runTest(app, assert, method, paths, expectedResponse);
  });
};
