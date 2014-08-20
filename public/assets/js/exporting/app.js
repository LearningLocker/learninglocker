define([
  'jquery',
  'backbone',
  'marionette',
  'controller'
], function($, Backbone, Marionette, AppController){
  var App = new Marionette.Application();

  var AppRouter = Marionette.AppRouter.extend({
    controller: new AppController({
      app: App
    }),
    appRoutes: {
      '': 'index'
    }
  });

  // Gets the LRS ID from the current url.
  App.lrs_id = window.location.pathname.split('lrs/')[1].split('/')[0];

  App.addRegions({
    fields: '#fields'
  });

  App.addInitializer(function (options) {
    // Add our CSRF token to every AJAX request.
    $.ajaxPrefilter(function(options, originalOptions, jqXHR){
      var token;
      if( !options.crossDomain ){
        token = $('meta[name="token"]').attr('content');
        if( token ){
          return jqXHR.setRequestHeader('X-CSRF-Token', token);
        }
      }
    });
  
    // Start router and history.
    new AppRouter();
    if (Backbone.history){
      Backbone.history.start();
    }
  });
  
  return App;
});