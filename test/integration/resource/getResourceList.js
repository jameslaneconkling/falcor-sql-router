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


test('resourceList: Should return resources from beginning of list', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourceList: {
      0: {
        id: 1,
        name: 'red',
        folderId: 1
      },
      1: {
        id: 2,
        name: 'green',
        folderId: 1
      }
    }
  };

  model.get(['resourceList', {'to': 1}, ['id', 'name', 'folderId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('resourceList: should return non-continguous resources from middle of list', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourceList: {
      2: {
        id: 3,
        name: 'magenta',
        folderId: 1
      },
      3: {
        id: 4,
        name: 'cyan',
        folderId: 1
      },
      5: {
        id: 6,
        name: 'light-urple',
        folderId: 2
      }
    }
  };

  model.get(['resourceList', [{'from':2, 'to':3}, 5], ['id', 'name', 'folderId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('resourceList: Should return null for resources that do not exist', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourceList: {
      100: null
    }
  };

  model.get(['resourceList', 100, ['id', 'name', 'folderId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('resourceList: Should return resource count', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourceList: {
      length: 9
    }
  };

  model.get(['resourceList', 'length'])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});
