define([
  'marionette'
], function (Marionette) {
  return Marionette.ItemView.extend({
    template: '#',
    events: {
      'click #remove': 'remove'
    },

    remove: function () {
      this.model.destroy();
    }
  });
});