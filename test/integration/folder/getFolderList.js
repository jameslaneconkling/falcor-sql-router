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


test('folderList: Should return folders from beginning of list', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    folderList: {
      0: {
        id: 1,
        name: 'root folder',
        parentId: null
      },
      1: {
        id: 2,
        name: 'folder1',
        parentId: 1
      }
    }
  };

  model.get(['folderList', {'to': 1}, ['id', 'name', 'parentId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('folderList: should return non-continguous folders from middle of list', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    folderList: {
      2: {
        id: 3,
        name: 'folder2',
        parentId: 1
      },
      3: {
        id: 4,
        name: 'folder3',
        parentId: 1
      },
      5: {
        id: 6,
        name: 'folder1.2',
        parentId: 2
      }
    }
  };

  model.get(['folderList', [{'from':2, 'to':3}, 5], ['id', 'name', 'parentId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('folderList: Should return null for folders that do not exist', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    folderList: {
      100: null
    }
  };

  model.get(['folderList', 100, ['id', 'name', 'parentId']])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('folderList: Should return folder count', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    folderList: {
      length: 9
    }
  };

  model.get(['folderList', 'length'])
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});


test('folderList: Should return folder with subfolders', assert => {
  assert.plan(1);
  const model = setupFalcorTestModel(dbConstructor({seed: seedFilePath}));
  const expectedResponse = {
    'folderList': {
      '0': {
        'name': 'root folder',
        'folders': {
          '0': {
            'id': 2,
            'name': 'folder1',
            'parentId': 1
          },
          '1': {
            'id': 3,
            'name': 'folder2',
            'parentId': 1
          }
        }
      }
    }
  };

  model.get(
    ['folderList', 0, 'name'],
    ['folderList', 0, 'folders', {'to': 1}, ['id', 'name', 'parentId']]
  )
    .subscribe(res => {
      assert.deepEqual(res.json, expectedResponse);
    }, assertFailure(assert));
});
