const test = require('tape');
const request = require('supertest');
const falcor = require('falcor');
const dbConstructor = require('../db');
const appConstructor = require('../app');
const SuperTestDataSource = require('./utils/superTestDataSource');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


test('folderList: Should unlink folder', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });

  model.call(['folderList', 3, 'unlink'])
    .subscribe(res => {
      assert.fail('todo');
    });
});


test('folderList: Should delete folder', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });

  model.call(['folderList', 3, 'delete'])
    .subscribe(res => {
      assert.fail('todo');
    });
});


test('folderList: Should create new folder', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });

  model.call(['folderList', 'create'])
    .subscribe(res => {
      assert.fail('todo');
    });
});
