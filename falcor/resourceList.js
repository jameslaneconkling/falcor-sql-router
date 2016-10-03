const falcor = require('falcor');
const Rx = require('rx');
const ResourceModelConstructor = require('../resource/resourceModel');
const $ref = falcor.Model.ref;

module.exports = db => {
  const Resource = ResourceModelConstructor(db);

  return [];
};
