define(['backbone'], function(backbone) {
  return backbone.Model.extend({
    // Adds utility methods (these should not override Marionette methods).
    _initializeRelations: function (response, empty) {
      var self = this;
      if (typeof self.relations === 'object') {
        Object.keys(self.relations).forEach(function (relation) {
          var value = empty ? null : response[relation];
          response[relation] = new self.relations[relation](value, {
            parent: self // Allows for nested urls.
          });
        });
      }

      return response;
    },
    _initializeUrl: function () {
      if (this.options.url) {
        this.url = function () {
          return this.options.url;
        };
      }
    },

    // Extends Marionette.
    initialize: function (data, opts) {
      var changes = {};
      this.options = opts;
      this._initializeUrl();
      this._initializeRelations(changes, true);
    },
    parse: function (response) {
      this._initializeRelations(response, false);
      return response;
    }
  });
});