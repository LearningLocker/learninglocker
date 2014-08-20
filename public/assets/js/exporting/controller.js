define([
  'marionette',
  'fields/collectionView',
  'fields/collection'
], function(Marionette, FieldCollectionView, FieldsCollection){
  return Marionette.Controller.extend({
    initialize: function (options) {
      this.app = options.app;
      this.options = options;
    },

    index: function () {
      this.app.fields.show(new FieldCollectionView({
        collection: new FieldsCollection([
          {
            'xAPIKey': 'lol'
          }
        ])
      }));
      window.fields = FieldsCollection;
    }
  });
});