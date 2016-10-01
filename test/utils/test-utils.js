const request = require('supertest');
const falcor = require('falcor');
const SuperTestDataSource = require('./superTestDataSource');

exports.setupFalcorTestModel = db => {
  const app = require('../../app')(db);
  return new falcor.Model({
    source: new SuperTestDataSource('/api/model.json', app)
  });
};

exports.runSuperTest = (app, assert, method, paths, expectedResponse) => {
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
