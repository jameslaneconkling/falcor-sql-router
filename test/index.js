const test = require('tape');
const request = require('supertest');
const app = require('../app');

test('Should get folder list at ["folderList", ...]', assert => {
  test('Should return folders at index 1 and 2', assert => {
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

    assert.plan(1);

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });

  test('Should return null for folders that do not exist', assert => {
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

    assert.plan(1);

    request(app)
      .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
      .end((err, res) => {
        assert.deepEqual(res.body, expectedResponse);
        assert.end();
      });
  });

  assert.end();
});