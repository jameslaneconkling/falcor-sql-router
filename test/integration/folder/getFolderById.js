const test = require('tape');
const dbConstructor = require('../../../db');
const {
  setupFalcorTestModel
} = require('../../utils/test-utils');

const seedFilePath = `${__dirname}/../../../db/sql/seed.sql`;
const assertFailure = assert => err => {
  assert.fail(err);
  assert.end();
};


test('foldersById: Should return folders with ID 1, 3, and 4', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
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
  };

  model.get(["foldersById", [1, 3, 4], ["id", "name", "parentId"]])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('foldersById: Should return null for folder that doesn\'t exist', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    "foldersById": {
      "nope": null
    }
  };

  model.get(["foldersById", "nope", ["id", "name", "parentId"]])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('foldersById: Should return folder with subfolders', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    "foldersById": {
      "1": {
        "name": "root folder",
        "id": 1,
        "folders": {
          "0": {
            "name": "folder1",
            "id": 2,
            "parentId": 1,
          },
          "1": {
            "id": 3,
            "name": "folder2",
            "parentId": 1
          },
          "2": {
            "id": 4,
            "name": "folder3",
            "parentId": 1
          }
        }
      },
      "2": {
        "name": "folder1",
        "id": 2,
        "folders": {
          "0": {
            "id": 5,
            "name": "folder1.1",
            "parentId": 2
          },
          "1": {
            "id": 6,
            "name": "folder1.2",
            "parentId": 2
          },
          "2": null
        }
      }
    }
  };

  model.get(
    ["foldersById", [1, 2], ["id", "name"]],
    ["foldersById", [1, 2], "folders", {"to":2}, ["id", "name", "parentId"]]
  )
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('foldersById: Should return folder with subfolder count', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
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
  };

  model.get(
    ["foldersById",[2, 3, 4], ["id", "name"]],
    ["foldersById",[2, 3, 4], "folders", "length"]
  )
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});
