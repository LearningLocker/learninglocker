define([
  'backbone',
  './Model',
  'basicauth'
], function(backbone, Model) {
  return backbone.Collection.extend({
    model: Model
  });
});