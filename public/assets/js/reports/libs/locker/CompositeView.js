define([
  'marionette',
  './ItemView',
  'bootstrap'
], function(Marionette, ItemView) {
  return Marionette.CompositeView.extend({
    // Adds utility methods (these should not override Marionette methods).
    _initHelperEvents: function () {
      this.events['click #add'] = this.add;
    },
    _initializeTemplate: ItemView.prototype._initializeTemplate,
    _fetchIfExists: function (model) {
      if (model) {
        return model.fetch();
      } else {
        return {
          success: function () {}
        };
      }
    },

    // Extends Marionette.
    childViewContainer: '#models',
    events: {},
    initialize: function (options) {
      this.options = options;
      this._initializeTemplate();
      this._initHelperEvents();
      this._fetchIfExists(this.collection);
    },

    // Defines callbacks for helper events.
    add: function () {
      this.collection.create({}, {wait: true});
    },
    onRender: function () {
      this.$el.find('[data-toggle="tooltip"]').tooltip();
    }
  });
});
