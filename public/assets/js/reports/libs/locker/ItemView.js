define([
  'underscore',
  'marionette'
], function(_, Marionette) {
  return Marionette.ItemView.extend({
    // Adds utility methods (these should not override Marionette methods).
    _initHelperEvents: function () {
      this.events['click #save'] = this.save;
      this.events['click #trash'] = this.trash;
      this.events['change input'] = this.changeValue;
    },
    _initializeTemplate: function () {
      this.template = _.template(this.template);
    },

    // Extends Marionette.
    events: {},
    tagName: 'tr',
    initialize: function (options) {
      this.options = options;
      this._initializeTemplate();
      this._initHelperEvents();
    },

    // Defines callbacks for helper events.
    save: function () {
      this.model.save().success(function (model, response, options) {
        alert(trans('site.saved'));
      }).error(function (model, response, options) {
        alert(trans('site.notSaved'));
        console.error(model, response, options);
      });
    },
    trash: function() {
      if (confirm(trans('site.sure'))) {
        return this.model.destroy();
      }
    },
    changeValue: function(e) {
      var changes = {};
      var prop = e.currentTarget.id.split('-').pop(); // Allows for collectionname-prop.

      changes[prop] = e.currentTarget.value;
      this.model.save(changes);
    },
    onRender: function () {
      this.$el.find('[data-toggle="tooltip"]').tooltip();
    }
  });
});
