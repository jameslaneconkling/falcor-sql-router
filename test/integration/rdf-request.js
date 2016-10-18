const test = require('tape');
const request = require('supertest');
const dbConstructor = require('../../db');
const appConstructor = require('../../app');

const seedFilePath = `${__dirname}/../../db/sql/seed.sql`;


test('RDF triple request', assert => {
  assert.plan(1);
  const db = dbConstructor({seed: seedFilePath});
  const app = appConstructor(db);

  const method = 'get';
  const paths = [
    ['foldersById', [1, 2], ['dcterms:relation', 'rivium:doc/path']] // doesn't work w/ hashes 'XMLSchema#string'
  ];
  const expectedResponse = {
    jsonGraph: {
      foldersById: {
        1: {
          'dcterms:relation': 1,
          'rivium:doc/path': 'root folder',
          'XMLSchema#string': null
        },
        2: {
          'dcterms:relation': 2,
          'rivium:doc/path': 'folder1',
          'XMLSchema#string': 1
        }
      }
    }
  };

  request(app)
    .get(`/api/model.json?method=${method}&paths=${JSON.stringify(paths)}`)
    .end((err, res) => {
      if (err) {
        assert.fail(err);
      }

      assert.deepEqual(res.body, expectedResponse);
    });
});