define([
  'underscore',
  'marionette',
  'text!./modelTemplate.html'
], function (_, Marionette, template) {
  return Marionette.ItemView.extend({
    template: _.template(template),
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