define([
  'underscore',
  'marionette',
  'locker',
  'text!./compositeView.html'
], function (_, marionette, locker, template) {
  return marionette.CompositeView.extend({
    template: template,

    initialize: function (options) {
      this.options = options;
      this._initializeTemplate();
      this._initHelperEvents();
    },

    // Defines helper event.
    add: function () {
      this.collection.add({value: ''}, this.templateHelpers());
    },
    templateHelpers: function () {
      return {
        example: this.example,
        type: this.type
      };
    },

    // Adds locker helper methods.
    _initHelperEvents: locker.CompositeView.prototype._initHelperEvents,
    _initializeTemplate: locker.ItemView.prototype._initializeTemplate,
    childViewContainer: locker.CompositeView.prototype.childViewContainer,
    events: locker.CompositeView.prototype.events,
    onRender: locker.CompositeView.prototype.onRender
  });
});
