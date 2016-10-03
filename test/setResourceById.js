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


test('resourcesById: Should update resource name', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourcesById: {
      2: {
        name: 'green edit1'
      }
    }
  };

  model.set({
    path: ['resourcesById', 2, 'name'],
    value: 'green edit1'
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['resourcesById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'green edit1', 'updated value is persisted');
        });
    }, assertFailure(assert));
});
