const falcor = require('falcor');
const ResourceModelConstructor = require('../resource/resourceModel');
const $ref = falcor.Model.ref;

module.exports = db => {
  const Resource = ResourceModelConstructor(db);

  return [
    // GET Resources from resourceList by index
    {
      route: 'resourceList[{ranges:ranges}]',
      get(pathSet) {
        const ranges = pathSet.ranges;

        return Resource.getByRanges(ranges, [])
          .map(data => {
            // if row doesn't exist, return null pathValue
            if (!data.row) {
              return {
                path: ['resourceList', data.idx],
                value: null
              };
            }

            // return pathValue ref to resource
            return {
              path: ['resourceList', data.idx],
              value: $ref(['resourcesById', data.row.id])
            };
          });
      }
    },
    // GET Resources Length
    {
      route: 'resourceList.length',
      get() {
        return Resource.getCount()
          .map(count => ({
            path: ['resourceList', 'length'],
            value: count
          }));
      }
    }
  ];
};
