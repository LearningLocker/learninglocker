define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    childView: ModelView,
    childViewContainer: '#fields',
    template: _.template(template),
    events: {
      'click #addField': 'addField'
    },

    addField: function () {
      this.collection.add({});
    }
  });
});