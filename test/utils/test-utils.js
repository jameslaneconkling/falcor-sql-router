const request = require('supertest');

exports.runTest = (app, assert, method, paths, expectedResponse) => {
  return request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
        return assert.end();
      }

      assert.deepEqual(res.body, expectedResponse);
      assert.end();
    });
};