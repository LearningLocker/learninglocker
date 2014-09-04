define([
  'backbone',
  './model'
], function (Backbone, Model) {
  return Backbone.Collection.extend({
    model: Model
  });
});