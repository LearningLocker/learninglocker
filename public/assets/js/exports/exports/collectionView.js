define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    itemView: _.template(template),
    template: '#',
    events: {
      'click #addExport': 'add'
    },

    add: function () {
      
    }
  });
});