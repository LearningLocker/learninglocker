require([
  'app',
  "appRouter",
  "controller",
],
function( App, AppRouter, AppController){

  App.appRouter = new AppRouter({
    controller:new AppController()
  });
    
  App.start();

});

