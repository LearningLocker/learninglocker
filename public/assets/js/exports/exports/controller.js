define([
  'marionette',
  './collectionView'
], function (Marionette, CollectionView) {
  return Marionette.Controller.extend({
    // Configuration.
    initialize: function (options) {
      this.app = options.app;
      this.options = options;
    },

    // Router methods.
    list: function () {
      this.app.content.show(new CollectionView());
    },

    item: function (exportId) {
      
    }
  });
});