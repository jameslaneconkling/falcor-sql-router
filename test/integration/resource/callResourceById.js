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
// * explicit dependencies like container.length and resourceList are updated in cache
// * dbGraph is updated

test('resourcesById: Should create multiple new resources', assert => {
  // arguably, creating resources outside the folder file system shouldn't not be possible
  assert.plan(4);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['resourcesById'];
  const args = [{name: 'black', folderId: 1}, {name: 'white', folderId: 1}];
  const refPaths = ['id', 'name', 'folderId'];
  const thisPath = [];
  const expectedResponse = {
    resourcesById: {
      10: {
        id: 10,
        name: 'black',
        folderId: 1
      },
      11: {
        id: 11,
        name: 'white',
        folderId: 1
      }
    }
  };


  Rx.Observable.just(null)
    .flatMap(() => {
      // prerequest dependent properties, so later we can test that they were invalidated
      return model.get(['resourceList', 'length']);
    })
    .flatMap(() => {
      return model.call([...callPath, 'createResource'], args, refPaths, thisPath);
    })
    .map(res => {
      const newResources = R.values(getGraphSubset(res.json, callPath, thisPath));

      assert.deepEqual(res.json, expectedResponse);

      // test if total resource count is properly invalidated in the cache
      assert.equal(
        R.path(['resourceList', 'length'], model.getCache(['resourceList', 'length'])),
        undefined,
        'resourceList count is invalidated'
      );

      // test if parent resource count is updated in cache
      assert.equal(
        R.path([...callPath, 'length'], model.getCache([...callPath, 'length'])),
        R.path([...callPath, 'length'], res.json),
        'new resources\' parent resource count is updated in cache'
      );

      // test if new resources are properly added to the dbGraph
      model.setCache({});
      model.get(['resourcesById', R.pluck('id', newResources), refPaths])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            resourcesById: R.zipObj(R.pluck('id', newResources), newResources)
          }, 'resources are properly referenced in graph');
        }, assertFailure(assert));
    })
    .subscribe(noop, assertFailure(assert));
});


test('resourcesById: Should delete multiple resources', assert => {
  assert.plan(3);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['resourcesById', [2, 3]];
  const args = [];
  const refPaths = [];
  const thisPath = [];
  const expectedResponse = {
    resourcesById: {
      2: null,
      3: null
    }
  };

  Rx.Observable.just(null)
    .flatMap(() => {
      // prerequest dependent properties, so later we can test that they were invalidated
      return model.get(
        ['resourceList', 'length']
      );
    })
    .flatMap(() => {
      return model.call([...callPath, 'delete'], args, refPaths, thisPath);
    })
    .map(res => {
      assert.deepEqual(res.json, expectedResponse);

      assert.equal(
        R.path(['resourceList', 'length'], model.getCache(['resourceList', 'length'])),
        undefined,
        'resourceList count is invalidated'
      );

      model.setCache({});
      model.get(['resourcesById', [2, 3, 4], 'id'])
        .subscribe(res => {
          assert.deepEqual(res.json, {
            resourcesById: {
              2: null,
              3: null,
              4: {id: 4}
            }
          }, 'resources are properly removed from graph');
        }, assertFailure(assert));
    })
    .subscribe(noop, assertFailure(assert));
});


test.skip('resourcesById: Should return error node on create resource failure', assert => {
  assert.plan(1);
  assert.fail('need to create and inject a test db driver that only returns errors');
});
