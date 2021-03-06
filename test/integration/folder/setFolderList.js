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


test('folderList: Should update folder name', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    folderList: {
      1: {
        name: 'root folder edit 1'
      }
    }
  };

  model.set({
    path: ['folderList', 1, 'name'],
    value: 'root folder edit 1'
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['folderList', 1, 'name'])
        .subscribe(name => {
          assert.equal(name, 'root folder edit 1', 'updated value is persisted');
        });
    }, assertFailure(assert));
});
