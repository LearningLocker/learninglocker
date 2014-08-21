define([
  'marionette',
  './modelView'
], function (Marionette, ModelView) {
  return Marionette.CompositeView.extend({
    template: '#fieldCollection',
    itemView: ModelView,
    itemViewContainer: '#fields',
    events: {
      'click #run': 'run',
      'click #download': 'download',
      'click #addField': 'addField'
    },

    run: function (event) {
      alert('RUN!!!');
    },

    download: function (event) {
      alert('DOWNLOAD!!!');
    },

    addField: function (event) {
      this.collection.add({
        'xAPIKey': ''
      })
    }
  });
});