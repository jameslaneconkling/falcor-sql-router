const test = require('tape');
const request = require('supertest');
const falcor = require('falcor');
const R = require('ramda');
const dbConstructor = require('../db');
const {
  getGraphSubset
} = require('../utils/falcor');
const appConstructor = require('../app');
const SuperTestDataSource = require('./utils/superTestDataSource');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


// CREATE/DELETE should test:
// * new value is created/deleted at root/
// * new value is referenced in container/ref
// * explicit dependencies like container.length and folderList are invalidated

test('foldersById: Should create one new folder', assert => {
  assert.plan(4);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
  const callPath = ['foldersById', 1, 'folders'];
  const args = [{name: 'folder 4'}];
  const refPaths = ['id', 'name', 'parentId'];
  const thisPath = ['length'];
  const expectedResponse = {
    "foldersById": {
      "1": {
        "folders": {
          "3": {"id": 10, "name": "folder 4", "parentId": 1},
          "length": 4
        }
      }
    }
  };

  model.call([...callPath, 'createSubFolder'], args, refPaths, thisPath)
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);

      // test if new folders are properly referenced in the graph
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));
      model.get(['foldersById', R.pluck('id', newFolders), refPaths])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            foldersById: R.zipObj(R.pluck('id', newFolders), newFolders)
          }, 'folders are properly referenced in graph');
        });

      model.getValue([...callPath, 'length'])
        .subscribe(parentSubFolderLength => {
          assert.deepEqual(parentSubFolderLength, R.path([...callPath, 'length'], res.json), 'new folders\' container length is updated');
        });

      model.getValue(['folderList', 'length'])
        .subscribe(folderCount => {
          assert.fail('TODO - test "total folder count is updated"');
          // assert.deepEqual(folderCount, initialFolderLength + newFolders.length, 'total folder count is updated');
        });
    }, err => {
      assert.fail(err);
    });
});


test('foldersById: Should create multiple new folders', assert => {
  assert.plan(4);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
  const callPath = ['foldersById', 1, 'folders'];
  const args = [{name: 'folder 4'}, {name: 'folder 5'}];
  const refPaths = ['id', 'name', 'parentId'];
  const thisPath = ['length'];
  const expectedResponse = {
    "foldersById": {
      "1": {
        "folders": {
          "3": {"id": 10, "name": "folder 4", "parentId": 1},
          "4": {"id": 11, "name": "folder 5", "parentId": 1},
          "length": 5
        }
      }
    }
  };

  model.call([...callPath, 'createSubFolder'], args, refPaths, thisPath)
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);

      // test if new folders are properly referenced in the graph
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));
      model.get(['foldersById', R.pluck('id', newFolders), refPaths])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            foldersById: R.zipObj(R.pluck('id', newFolders), newFolders)
          }, 'folders are properly referenced in graph');
        });

      model.getValue([...callPath, 'length'])
        .subscribe(parentSubFolderLength => {
          assert.deepEqual(parentSubFolderLength, R.path([...callPath, 'length'], res.json), 'new folders\' container length is updated');
        });

      model.getValue(['folderList', 'length'])
        .subscribe(folderCount => {
          assert.fail('TODO - test "total folder count is updated"');
          // assert.deepEqual(folderCount, initialFolderLength + newFolders.length, 'total folder count is updated');
        });
    }, err => {
      assert.fail(err);
    });
});


test('foldersById: Should return error node on create folder failure', assert => {
  assert.plan(1);
  assert.fail('need to create and inject a test db driver that only returns errors');
});
