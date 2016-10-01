const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const {
  setupFalcorTestModel
} = require('./utils/test-utils');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


test('folderList: Should unlink folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 3, 'unlink'])
});


test('folderList: Should delete folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 3, 'delete'])
});


test('folderList: Should create new folder', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));

  assert.fail('todo');
  model.call(['folderList', 'create'])
});
