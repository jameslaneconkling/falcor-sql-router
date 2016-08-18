const FalcorServer = require('falcor-express');
const Router = require('falcor-router');
const foldersRoutes = require('./folders');
const resourceRoutes = require('./resources');

const BaseRouter = Router.createClass([
  ...foldersRoutes,
  ...resourceRoutes
]);

// To subclass:
// const SubRouter = function(prop) {
//   BaseRouter.call(this);
//   this.prop = prop;
// };
//
// SubRouter.prototype = Object.create(BaseRouter.prototype);

module.exports = FalcorServer.dataSourceRoute((req, res) => {
  res.type('json');
  return new BaseRouter();

  // mock
  // return new falcor.Model({
  //   cache: {
  //     foldersById: {
  //       1: {
  //         name: 'folder1',
  //       },
  //       2: {
  //         name: 'folder2',
  //       }
  //     }
  //   }
  // }).asDataSource();
});
