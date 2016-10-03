const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../../../db');
const {
  setupFalcorTestModel
} = require('../../utils/test-utils');

const seedFilePath = `${__dirname}/../../../db/sql/seed.sql`;


test.skip('folderList: Should unlink folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 3, 'unlink'])
});


test.skip('folderList: Should delete folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 3, 'delete'])
});


test.skip('folderList: Should create new folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 'create'])
});
