const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const appConstructor = require('../app');

module.exports = () => {
  // TODO - these probably need callbacks to ensure they complete before tests run
  // TODO - simplify dbConstructor so it can be passed a config: in-memory/file seedSQL/not
  // TODO - import/build client falcor parsing lib to recreate response
  // TODO - switch to tap diff: https://github.com/axross/tap-diff
  const db = dbConstructor();
  const app = appConstructor(db);

  test('setup', assert => {
    require('../db/seed')(db, err => {
      if (err) {
        assert.fail(err);
      }
      assert.end();
    });
  });


  test('folderList: Should return folders from beginning of list', assert => {
    const method = 'get';
    const paths = [
      ["folderList", {"to": 1}, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          0: { $type: "ref", value: [ "foldersById", 1 ] },
          1: { $type: "ref", value: [ "foldersById", 2 ] }
        },
        foldersById: {
          1: {
            id: 1,
            name: "root folder",
            parentId: null
          },
          2: {
            id: 2,
            name: "folder1",
            parentId: 1
          }
        }
      }
    };

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });


  test('folderList: should return non-continguous folders from middle of list', assert => {
    const method = 'get';
    const paths = [
      ["folderList", [{"from":2, "to":3}, 5], ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          2: { $type: "ref", value: [ "foldersById", 3 ] },
          3: { $type: "ref", value: [ "foldersById", 4 ] },
          5: { $type: "ref", value: [ "foldersById", 6 ] },
        },
        foldersById: {
          3: {
            id: 3,
            name: "folder2",
            parentId: 1
          },
          4: {
            id: 4,
            name: "folder3",
            parentId: 1
          },
          6: {
            id: 6,
            name: "folder1.2",
            parentId: 2
          }
        }
      }
    };

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });


  test('folderList: Should return null for folders that do not exist', assert => {
    const method = 'get';
    const paths = [
      ["folderList", 100, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          100: null
        }
      }
    };

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });

  test('folderList: Should return folder count', assert => {
    const method = 'get';
    const paths = [
      ["folderList", "length"]
    ];
    const expectedResponse = {
      jsonGraph: {
        folderList: {
          length: 9
        }
      }
    };

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });
};
