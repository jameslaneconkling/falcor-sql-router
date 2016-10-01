const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const {
  setupFalcorTestModel
} = require('./utils/test-utils');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


test('folderList: Should update folder name with a pathSet', assert => {
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
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
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