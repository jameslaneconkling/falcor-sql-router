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
const noop = () => undefined;


test.skip('folderList: Should unlink folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 3, 'unlink']);
});


test.skip('folderList: Should create new folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 'create']);
});


test.skip('folderList: Should delete folder', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const callPath = ['folderList', [1,2]];
  const args = [];
  const refPaths = [];
  const thisPath = [];
  const expectedResponse = {
    folderList: {
      1: null,
      2: null
    }
  };

  model.call([...callPath, 'delete'], args, refPaths, thisPath)
    .map(res => {
      assert.deepEqual(res.json, expectedResponse);
    })
    .flatMap(() => {
      return model.get(['folderList', {to:2}, ['id', 'name']]);
    })
    .map(res => {
      // deleted folders should no longer be in list (this request requires another roundtrip)
      assert.deepEqual(res.json, {
        folderList: {
          0: {id: 1, name: 'root folder'},
          1: {id: 4, name: 'folder3'},
          2: {id: 5, name: 'folder1.1'}
        }
      }, 'deleted folders are not found in folderList');
    })
    .subscribe(() => {}, assertFailure(assert));
});
