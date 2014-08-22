define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    itemView: ModelView,
    template: _.template(template),
    events: {
      'change #reports': 'change'
    },

    change: function (event) {
      
    }
  });
});