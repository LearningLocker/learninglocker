define([
  'marionette'
], function (Marionette) {
  return Marionette.AppRouter.extend({
    appRoutes: {
      '': 'list',
      'new': 'new',
      ':exportId': 'item'
    }
  });
});