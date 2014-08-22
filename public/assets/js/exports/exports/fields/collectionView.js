define([
  'marionette',
  './modelView'
], function (Marionette, ModelView) {
  return Marionette.CompositeView.extend({
    itemView: ModelView,
    template: '#'
  });
});