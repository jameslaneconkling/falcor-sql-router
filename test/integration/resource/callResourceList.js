const test = require('tape');
const dbConstructor = require('../../../db');
const {
  setupFalcorTestModel
} = require('../../utils/test-utils');

const seedFilePath = `${__dirname}/../../../db/sql/seed.sql`;


test.skip('resourceList: Should unlink resource', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['resourceList', 3, 'unlink']);
});


test.skip('resourceList: Should delete resource', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['resourceList', 3, 'delete']);
});


test.skip('resourceList: Should create new resource', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['resourceList', 'create']);
});
