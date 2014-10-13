define(['backbone'], function(Backbone) {
  return Backbone.Collection.extend({
    // Sets the url using the parents and the nested url of the collection.
    // Allows the url to become `users/1/friends` for example.
    url: function () {
      var parent = this.options.parent;
      return parent ? parent.url() + '/' + this.nestedUrl : null;
    },
    initialize: function (data, opts) {
      this.options = opts;
    }
  });
});