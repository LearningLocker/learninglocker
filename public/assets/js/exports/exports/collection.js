define([
  'backbone',
  './model',
  'basicauth'
], function (Backbone, Model) {
  return Backbone.Collection.extend({
    model: Model,
    url: '../../api/v1/exports',
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
    comparator: function (model) {
      return model.get('created_at');
    }
  });
});