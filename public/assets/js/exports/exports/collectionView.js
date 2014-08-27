define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    childView: ModelView,
    template: _.template(template),
    childViewContainer: '#exports'
  });
});