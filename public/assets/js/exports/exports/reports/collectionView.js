define([
  'marionette',
  './modelView'
], function (Marionette, ModelView) {
  return Marionette.CompositeView.extend({
    itemView: ModelView,
    template: '#',
    events: {
      'change #reports': 'change'
    },

    change: function (event) {
      
    }
  });
});