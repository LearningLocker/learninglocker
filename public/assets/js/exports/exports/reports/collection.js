define([
  'backbone',
  './model',
  'basicauth'
], function (Backbone, Model) {
  return Backbone.Collection.extend({
    model: Model,
    url: '../../api/v1/reports',
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
  });
});