const test = require('tape');
const Rx = require('rx');
const dbConstructor = require('../../../db');
const {
  setupFalcorTestModel
} = require('../../utils/test-utils');
const {
  getGraphSubset
} = require('../../../utils/falcor');
const R = require('ramda');

const seedFilePath = `${__dirname}/../../../db/sql/seed.sql`;
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


test('foldersById: Should create multiple new folders', assert => {
  assert.plan(4);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['foldersById', 1, 'folders'];
  const args = [{name: 'folder 4'}, {name: 'folder 5'}];
  const refPaths = ['id', 'name', 'parentId'];
  const thisPath = ['length'];
  const expectedResponse = {
    'foldersById': {
      '1': {
        'folders': {
          '3': {'id': 10, 'name': 'folder 4', 'parentId': 1},
          '4': {'id': 11, 'name': 'folder 5', 'parentId': 1},
          'length': 5
        }
      }
    }
  };


  Rx.Observable.just(null)
    .flatMap(() => {
      // prerequest dependent properties, so later we can test that they were invalidated
      return model.get(['folderList', 'length']);
    })
    .flatMap(() => {
      return model.call([...callPath, 'createSubFolder'], args, refPaths, thisPath);
    })
    .map(res => {
      const newFolders = R.values(getGraphSubset(res.json, callPath, thisPath));

      assert.deepEqual(res.json, expectedResponse);

      // test if total folder count is properly invalidated in the cache
      assert.equal(
        R.path(['folderList', 'length'], model.getCache(['folderList', 'length'])),
        undefined,
        'folderList count is invalidated'
      );

      // test if parent folder count is updated in cache
      assert.equal(
        R.path([...callPath, 'length'], model.getCache([...callPath, 'length'])),
        R.path([...callPath, 'length'], res.json),
        'new folders\' parent folder count is updated in cache'
      );

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
  assert.plan(3);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['foldersById', [2,3]];
  const args = [];
  const refPaths = [];
  const thisPath = [];

  // prerequest dependent properties, so later we can test that they were invalidated
  model.get(['folderList', 'length'])
    .flatMap(() => {
      return model.call([...callPath, 'delete'], args, refPaths, thisPath);
    })
    .subscribe(noop, noop, () => {
      // foldeList.length is an explicit dependency
      assert.equal(
        R.path(['folderList', 'length'], model.getCache(['folderList', 'length'])),
        undefined,
        'folderList count is invalidated'
      );

      // folder.folders.length is an implicit depdency, so not handled by server response
      // assert.equal(
      //   R.path(['foldersById', 1, 'folders', 'length'], model.getCache(['foldersById', 1, 'folders', 'length'])),
      //   undefined,
      //   'deleted folders\' parent subfolder count is invalidated'
      // );

      model.setCache({});
      model.get(['foldersById', [2, 3, 4], 'id'])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            foldersById: {
              4: {id: 4}
            }
          }, 'folders 2 and 3 are properly removed from graph');
        }, err => {
          assert.equal(err.length, 2, 'folders are returned as an error node');
        });
    });
});


test.skip('foldersById: Should return error node on create folder failure', assert => {
  assert.plan(1);
  assert.fail('need to create and inject a test db driver that only returns errors');
});
