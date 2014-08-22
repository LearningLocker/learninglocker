define([
  'backbone'
], function (Backbone) {
  return Backbone.Model.extend({
    '_id': '',
    'name': '',
    'description': '',
    'filters': ''
  });
});