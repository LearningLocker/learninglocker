define([
  'marionette'
], function (Marionette) {
  return Marionette.AppRouter.extend({
    appRoutes: {
      "/": "list",
      "/:exportId": "item"
    }
  });
});