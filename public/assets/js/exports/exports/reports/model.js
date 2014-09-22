define([
  'backbone',
  'basicauth'
], function (Backbone) {
  return Backbone.Model.extend({
    idAttribute: "_id",
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
  });
});