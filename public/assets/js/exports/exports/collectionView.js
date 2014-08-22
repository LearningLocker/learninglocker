define([
  'marionette',
  './modelView'
], function (Marionette, ModelView) {
  return Marionette.CompositeView.extend({
    itemView: ModelView,
    template: '#',
    events: {
      'click #addExport': 'add'
    },

    add: function () {
      
    }
  });
});