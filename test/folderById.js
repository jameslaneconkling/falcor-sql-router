const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../db');
const appConstructor = require('../app');

module.exports = () => {
  const db = dbConstructor();
  const app = appConstructor(db);

  test('["foldersById", ...] setup', assert => {
    require('../db/seed')(db, err => {
      if (err) {
        assert.fail(err);
      }
      assert.end();
    });
  });

  test('["foldersById", ...] Should return folders with ID 1, 3, and 4', assert => {
    const method = 'get';
    const paths = [
      ["foldersById", [1, {"from": 3, "to": 4}], ["id", "name", "parentId"]]
    ];
    const expectedResponse = {
      "jsonGraph": {
        "foldersById": {
          "1": {
            "id": 1,
            "name": "root folder",
            "parentId": null
          },
          "3": {
            "id": 3,
            "name": "folder2",
            "parentId": 1
          },
          "4": {
            "id": 4,
            "name": "folder3",
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
};
