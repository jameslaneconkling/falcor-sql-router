const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const {
  setupFalcorTestModel
} = require('./utils/test-utils');
const seedFilePath = `${__dirname}/../db/sql/seed.sql`;


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
    }, err => {
      assert.fail(err);
    }, () => {
      model.getValue(['foldersById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'folder1 edit1', 'updated value is persisted');
        });
    });
});


test('foldersById: Should update folder name with a jsonGraphEnvelope', assert => {
  assert.plan(2);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    foldersById: {
      2: {
        name: 'folder1 edit2'
      }
    }
  };

  model.set({
    "jsonGraph": {
      "foldersById": {2: {"name": "folder1 edit2"}}
    },
    "paths": [["foldersById", 2, "name"]]
  })
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse, 'set returns updated value');
    }, err => {
      assert.fail(err)
    }, () => {
      model.getValue(['foldersById', 2, 'name'])
        .subscribe(name => {
          assert.equal(name, 'folder1 edit2', 'updated value is persisted');
        });
    });
});