const test = require('tape');
const request = require('supertest');
const falcor = require('falcor');
const dbConstructor = require('../db');
const appConstructor = require('../app');
const SuperTestDataSource = require('./utils/SuperTestDataSource');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;

/*******************************/
/** Test against Falcor Model **/
/*******************************/
test('Example Test against Falcor Model- folderList: Should return folders from beginning of list', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

  const expectedResponse = {
    folderList: {
      0: {
        id: 1,
        name: "root folder",
        parentId: null
      },
      1: {
        id: 2,
        name: "folder1",
        parentId: 1
      }
    }
  };

  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });

  model.get(["folderList", {"to": 1}, ["id", "name", "parentId"]])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, err => {
      assert.fail(err);
    });
});


test('Example Test against Falcor Model- foldersById: Should return folders with ID 1, 3, and 4', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

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

  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });

  model.get(["foldersById", [1, 3, 4], ["id", "name", "parentId"]])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, err => {
      assert.fail(err);
    });
});


/*********************************/
/** Test as direct ajax request **/
/*********************************/
test('Example Test as ajax request - folderList: Should return folders from beginning of list', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

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

  request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
      }

      assert.deepEqual(res.body, expectedResponse);
    });
});


test('Example Test as ajax request - foldersById: Should return folders with ID 1, 3, and 4', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

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

  request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
      }

      assert.deepEqual(res.body, expectedResponse);
    });
});
