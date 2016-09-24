const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const appConstructor = require('../app');

module.exports = () => {
  // TODO - these probably need callbacks to ensure they complete before tests run
  // TODO - simplify dbConstructor so it can be passed a config: in-memory/file seedSQL/not
  const db = dbConstructor();
  const app = appConstructor(db);

  test('["folderList", ...] setup', assert => {
    require('../db/seed')(db, err => {
      if (err) {
        assert.fail(err);
      }
      assert.end();
    });
  });

  test('["folderList", ...] Should return folders at index 1 and 2', assert => {
    const method = 'get';
    const paths = [
      ["folderList", [{"from":1, "to":2}], ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "folderList": {
          "1": {
            "$type": "ref",
            "value": [
              "foldersById",
              1
            ]
          },
          "2": {
            "$type": "ref",
            "value": [
              "foldersById",
              2
            ]
          }
        },
        "foldersById": {
          "1": {
            "id": 1,
            "name": "root folder",
            "parentId": null
          },
          "2": {
            "id": 2,
            "name": "folder1",
            "parentId": 1
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

  test('["folderList", ...] Should return null for folders that do not exist', assert => {
    const method = 'get';
    const paths = [
      ["folderList", 100, ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "folderList": {
          "100": null
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
