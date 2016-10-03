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


test('resourcesById: Should return resources with ID 1, 4, and 5', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    'resourcesById': {
      '1': {
        'id': 1,
        'name': 'red',
        'folderId': 1
      },
      '4': {
        'id': 4,
        'name': 'cyan',
        'folderId': 1
      },
      '5': {
        'id': 5,
        'name': 'orange',
        'folderId': 2
      }
    }
  };

  model.get(['resourcesById', [1, 4, 5], ['id', 'name', 'folderId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('resourcesById: Should return null for resource that doesn\'t exist', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    'resourcesById': {
      'nope': null
    }
  };

  model.get(['resourcesById', 'nope', ['id', 'name', 'folderId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});
