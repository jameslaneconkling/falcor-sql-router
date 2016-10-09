const Rx = require('rx');
const request = require('supertest');

/**
 * A Falcor DataSource class for testing Express Falcor routes using SuperTest
 *
 * Testing against a Falcor Model has the added benefit of allowing the test to
 * assert exactly what a client would receive, e.g. by resolving refs
 *
 * Testing against a Falcor Model _will not_ test overfetching or underfetching.
 * E.g. if a route accidentally returns more data than it should, the extra data
 * will be dropped silently by the Falcor Model
 * Similarly, if a route returns less data than it should, the model will silently
 * make a subsequent request in order to finish building the JSONGraph snippet
 *
 * Testing against a Falcor Model _will_ ensure that the client eventually receives
 * all the data it needs (just not necessarily as efficiently as possible)
 *
 * To use:
 *
 *  const model = new falcor.Model({
 *    source: new SuperTestDataSource('/api/model.json', app)
 *  });
 *
 *  model.get(["foldersById", [1, 3, 4], ["id", "name", "parentId"]])
 *    .subscribe(res => {
 *      assert.deepEqual(res.json, expectedResponse);
 *    }, err => {
 *      assert.fail(err);
 *    });
 *
 */
module.exports = class SuperTestDataSource {
  constructor(url, app) {
    this.url = url;
    this.app = app;
  }

  get(pathSet) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .get(`${this.url}?method=get&paths=${JSON.stringify(pathSet)}`)
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }

  set(jsonGraphEnvelope) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .post(this.url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          method: 'set',
          jsonGraph: JSON.stringify(jsonGraphEnvelope)
        })
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }

  call(callPath, args, refPaths, thisPaths) {
    return Rx.Observable.create(observer => {
      request(this.app)
        .post(this.url)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          method: 'call',
          callPath: JSON.stringify(callPath),
          arguments: JSON.stringify(args),
          pathSuffixes: JSON.stringify(refPaths),
          paths: JSON.stringify(thisPaths)
        })
        .end((err, res) => {
          if (err) {
            return observer.onError(err);
          }

          observer.onNext(res.body);
          observer.onCompleted();
        });
    });
  }
};
