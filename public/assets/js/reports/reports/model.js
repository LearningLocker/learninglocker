define([
  'locker',
  'basicauth'
], function(locker) {
  return locker.Model.extend({
    idAttribute: '_id',
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    }
  });
});