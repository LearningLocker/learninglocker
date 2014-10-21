define([
  'beagle',
  './collection',
  './model',
  './table',
  './editLayout',
  './runLayout'
], function(
  beagle,
  Collection,
  Model,
  Table,
  EditLayout,
  RunLayout
) {
  var collection = new Collection();

  return beagle.routes({
    // List.
    '': function (params, path) {
      collection.url = params.url + '/' + collection.nestedUrl;
      params.app.content.show(new Table({
        collection: collection
      }));
    },

    // Item.
    ':id/edit': function (params, path) {
      params.app.content.show(new EditLayout({
        model: new Model({}, {
          url: params.url
        })
      }));
    },
    ':id/graph': function (params, path) {
      params.app.content.show(new RunLayout({
        model: new Model({}, {
          url: params.url
        })
      }));
    }
  }, {
    'id': function (id, params) {
      params.url += '/' + collection.nestedUrl + '/' + id;
      return id;
    }
  });
});