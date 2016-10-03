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


test('resourceList: Should update resource name with a pathSet', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    resourceList: {
      1: {
        name: 'green edit 1'
      }
    }
  };

  model.set({
    path: ['resourceList', 1, 'name'],
    value: 'green edit 1'
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');

      // clear client cache, to ensure subsequent tests run against server db
      model.setCache({});

      model.getValue(['resourceList', 1, 'name'])
        .subscribe(name => {
          assert.equal(name, 'green edit 1', 'updated value is persisted');
        });
    }, assertFailure(assert));
});
