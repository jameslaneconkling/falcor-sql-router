const test = require('tape');
const request = require('supertest');
const Rx = require('rx');
const dbConstructor = require('../db');
const {
  setupFalcorTestModel
} = require('./utils/test-utils');
const {
  getGraphSubset
} = require('../utils/falcor');
const R = require('ramda');

const seedFilePath = `${__dirname}/../db/sql/seed.sql`;
const assertFailure = assert => err => {
  assert.fail(err);
  assert.end();
};
const noop = () => undefined;


// CREATE/DELETE should test:
// * response is expected
// * value is created/deleted in cache (not currently doing this b/c the assumption is that if the response is correct, the correct items were created and persisted, bad idea?)
// * explicit dependencies like container.length and folderList are updated in cache
// * dbGraph is updated

test('foldersById: Should create one new folder', assert => {
  assert.plan(4);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
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

  Rx.Observable.just(null)
    .flatMap(() => {
      // prefetch folder subfolder count for test
      return model.getValue(['folderList', 'length']);
    })
    .flatMap(initialFolderCount => {
      // run create query
      return model.call([...callPath, 'createSubFolder'], args, refPaths, thisPath).map(res => Object.assign(res, {initialFolderCount}));
    })
    .map(res => {
      assert.deepEqual(res.json, expectedResponse);

      return res;
    })
    .map(res => {
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));

      // test if total folder count is properly invalidated in the cache
      assert.equal(R.path(['folderList', 'length'], model.getCache(['folderList', 'length'])), undefined, 'folderList count is invalidated');

      // test if parent folder count is updated in cache
      assert.equal(
        R.path([...callPath, 'length'], model.getCache([...callPath, 'length'])),
        R.path([...callPath, 'length'], res.json),
        'new folder\'s parent folder count is updated in cache'
      );

      return res;
    })
    .map(res => {
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));

      // test if new folders are properly added to the db
      model.setCache({});
      model.get(['foldersById', R.pluck('id', newFolders), refPaths])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            foldersById: R.zipObj(R.pluck('id', newFolders), newFolders)
          }, 'folders are properly referenced in cache');
        }, assertFailure(assert));
    })
    .subscribe(noop, assertFailure(assert));
});


test('foldersById: Should create multiple new folders', assert => {
  assert.plan(4);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
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

  Rx.Observable.just(null)
    .flatMap(() => {
      // prefetch folder subfolder count for test
      return model.getValue(['folderList', 'length']);
    })
    .flatMap(initialFolderCount => {
      // run create query
      return model.call([...callPath, 'createSubFolder'], args, refPaths, thisPath).map(res => Object.assign(res, {initialFolderCount}));
    })
    .map(res => {
      assert.deepEqual(res.json, expectedResponse);
      return res;
    })
    .map(res => {
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));

      // test if total folder count is properly invalidated in the cache
      assert.equal(R.path(['folderList', 'length'], model.getCache(['folderList', 'length'])), undefined, 'folderList count is invalidated');

      // test if parent folder count is updated in cache
      assert.equal(
        R.path([...callPath, 'length'], model.getCache([...callPath, 'length'])),
        R.path([...callPath, 'length'], res.json),
        'new folders\' parent folder count is updated in cache'
      );

      return res;
    })
    .map(res => {
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));

      // test if new folders are properly added to the dbGraph
      model.setCache({});
      model.get(['foldersById', R.pluck('id', newFolders), refPaths])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            foldersById: R.zipObj(R.pluck('id', newFolders), newFolders)
          }, 'folders are properly referenced in graph');
        }, assertFailure(assert));
    })
    .subscribe(noop, assertFailure(assert));
});


test('foldersById: Should delete multiple folders', assert => {
  assert.plan(4);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['foldersById', [2,3]];
  const args = [];
  const refPaths = [];
  const thisPath = [];
  const expectedResponse = {
    foldersById: {
      2: null,
      3: null
    }
  };

  model.call([...callPath, 'delete'], args, refPaths, thisPath)
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.get(['foldersById', [2,3,4], 'id'])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            2: null,
            3: null,
            4: {id: 4}
          }, 'folders are properly removed from graph');
        }, assertFailure(assert));

      model.getValue(['folderList', 1, 'length'])
        .subscribe(parentFolderCount => {
          assert.deepEqual(parentFolderCount, 1, 'parent folder count does not include deleted folders');
        }, assertFailure(assert));

      model.getValue(['folderList', 'length'])
        .subscribe(folderCount => {
          assert.fail('TODO - test "total folder count is updated"');
          // assert.deepEqual(folderCount, initialFolderLength + newFolders.length, 'total folder count is updated');
        }, assertFailure(assert));
    }, assertFailure(assert));
});


test.skip('foldersById: Should return error node on create folder failure', assert => {
  assert.plan(1);
  assert.fail('need to create and inject a test db driver that only returns errors');
});
