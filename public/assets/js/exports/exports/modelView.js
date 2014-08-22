define([
  'marionette'
], function (Marionette) {
  return Marionette.ItemView.extend({
    template: '#',
    events: {
      'click #run': 'run',
      'click #download': 'download',
      'click #delete': 'delete'
    },

    run: function () {
      
    },

    download: function () {
      
    },

    delete: function () {
      this.model.destroy();
    }
  });
});