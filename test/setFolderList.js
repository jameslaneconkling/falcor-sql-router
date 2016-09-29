const test = require('tape');
const request = require('supertest');
const falcor = require('falcor');
const dbConstructor = require('../db');
const appConstructor = require('../app');
const SuperTestDataSource = require('./utils/superTestDataSource');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


test('folderList: Should update folder name with a pathSet', assert => {
  assert.plan(2);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
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
    }, err => {
      assert.fail(err)
    }, () => {
      model.getValue(['folderList', 1, 'name'])
        .subscribe(name => {
          assert.equal(name, 'root folder edit 1', 'updated value is persisted');
        });
    });
});


test('folderList: Should update folder name with a jsonGraphEnvelope', assert => {
  assert.plan(2);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);
  const model = new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
  const expectedResponse = {
    folderList: {
      1: {
        name: "root folder edit 2"
      }
    }
  };

  model.set({
    "jsonGraph": {
      "folderList": {"1": {"name": "root folder edit 2"}}
    },
    "paths": [["folderList", "1", "name"]]
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');
    }, err => {
      assert.fail(err)
    }, () => {
      model.getValue(['folderList', "1", 'name'])
        .subscribe(name => {
          assert.equal(name, 'root folder edit 2', 'updated value is persisted');
        });
    });
});