define([
  'backbone'
], function (Backbone) {
  return Backbone.Model.extend({
    _id: '',
    fields: '',
    reports: '',
    name: '',
    description: ''
  });
});