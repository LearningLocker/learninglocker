define([
  'locker',
  './model',
  'basicauth'
], function(locker, Model) {
  return locker.Collection.extend({
    model: Model,
    nestedUrl: 'run',
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
    comparator: function(statementA, statementB) {
      var timeA = statementA.get('timestamp');
      var timeB = statementB.get('timestamp');
      if (timeA < timeB) {
        return 1;
      } else if (timeA > timeB) {
        return -1;
      } else {
        return 0;
      }
    }
  });
});