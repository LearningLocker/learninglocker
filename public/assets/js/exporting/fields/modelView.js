define([
  'marionette'
], function (Marionette) {
  return Marionette.ItemView.extend({
    template: '#fieldModel',
    events: {
      'click #remove': 'removeField'
    },

    removeField: function (event) {
      this.model.destroy();
    }
  });
});