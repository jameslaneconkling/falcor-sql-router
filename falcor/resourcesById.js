const Rx = require('rx');
const ResourceModelConstructor = require('../resource/resourceModel');

module.exports = db => {
  const Resource = ResourceModelConstructor(db);

  return [
    // GET SET Resources by IDs
    {
      route: 'resourcesById[{keys:ids}][{keys:fields}]',
      get(pathSet) {
        const resourceSource = Resource.getByIds(pathSet.ids, pathSet.fields);

        // convert missing rows into null pathValue
        const nullPathValues = resourceSource
          .filter(data => !data.row)
          .map(data => ({
            path: ['resourcesById', data.id],
            value: null
          }));

        // break rows down into fields and convert each into a pathValue
        const pathValues = resourceSource
          .filter(data => data.row)
          .reduce((accumulator, data) => {
            const pathValuesByField = Object.keys(data.row).map(field => ({
              path: ['resourcesById', data.id, field],
              value: data.row[field]
            }));

            return [...accumulator, ...pathValuesByField];
          }, []);

        return Rx.Observable.merge(nullPathValues, pathValues);
      },
      set(jsonGraph) {
        const resources = jsonGraph.resourcesById;
        const ids = Object.keys(resources);

        return Rx.Observable.from(ids)
          .flatMap(id => Resource.setRow(id, resources[id]))
          .map(data => {
            return {
              path: ['resourcesById', data.id, data.field],
              value: data.value
            };
          });
      }
    },
    // CREATE Resource
    {
      route: 'resourcesById.createResource',
      call(callPath, args) {
        const newResources = args;

        return Rx.Observable.from(newResources)
          .flatMap(resource => {
            // create resource
            return Resource.create(resource.name, resource.folderId);
          })
          .map(resource => {
            const resourcePathValues = Object.keys(resource).map(field => ({
              path: ['resourcesById', resource.id, field],
              value: resource[field]
            }));

            const resourceCollectionLengthPathValue = {
              path: ['resourceList', 'length'],
              invalidated: true
            };

            return [...resourcePathValues, resourceCollectionLengthPathValue];
          });
      }
    },
    // DELETE Resources by ID [implicit]
    {
      route: 'resourcesById[{keys:ids}].delete',
      call(callPath) {
        // resourceList is treated as an implicit dependency, so invalidation must be handled by client
        return Resource.deleteByIds(callPath.ids)
          .map(id => ([
            {
              path: ['resourcesById', id],
              value: null
            },
            {
              path: ['resourceList', 'length'],
              invalidated: true
            }
          ]));
      }
    }
  ];
};
