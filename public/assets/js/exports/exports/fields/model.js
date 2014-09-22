define([
  'backbone'
], function (Backbone) {
  return Backbone.Model.extend({
    defaults: {
      from: '',
      to: ''
    }
  });
});