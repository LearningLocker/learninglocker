define([
  'marionette',
], function(Marionette){
  return Marionette.AppRouter.extend({
    appRoutes: {
      '': 'index'
    }
  });
});