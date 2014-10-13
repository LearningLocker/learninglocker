define([
  'locker',
  'basicauth'
], function(locker) {
  return locker.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: null,
      name: null,
      description: null,
      lrs: window.lrsId
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    }
  });
});