define([
  'beagle',
  './collection',
  './table',
  './layout',
  './model'
], function(beagle, Collection, Table, Layout, Model) {
  return beagle.routes({
    // List.
    '': function (params, path) {
      params.collection.url = params.url + '/' + params.collection.nestedUrl;
      params.app.content.show(new Table({
        collection: params.collection
      }));
    },

    // Item.
    ':id/edit': function (params, path) {
      params.app.content.show(new Layout({
        model: new Model({}, {
          url: params.url
        })
      }));
    },
    ':id/run': function (params, path) {
      params.app.content.show(new Layout({
        model: new Model({}, {
          url: params.url
        })
      }));
    }
  }, {
    'id': function (id, params) {
      params.url += '/' + params.collection.nestedUrl + '/' + id;
      return id;
    }
  });
});