const test = require('tape');
const dbConstructor = require('../db');
const {
  setupFalcorTestModel
} = require('./utils/test-utils');

const seedFilePath = `${__dirname}/../db/sql/seed.sql`;
const assertFailure = assert => err => {
  assert.fail(err);
  assert.end();
};


test('foldersById: Should update folder name with a pathSet', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    foldersById: {
      2: {
        name: 'folder1 edit1'
      }
    }
  };

  model.set({
    path: ['foldersById', 2, 'name'],
    value: 'folder1 edit1'
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['foldersById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'folder1 edit1', 'updated value is persisted');
        });
    }, assertFailure(assert));
});
