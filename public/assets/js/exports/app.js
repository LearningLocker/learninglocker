define([
  'jquery',
  'backbone',
  'marionette',
  './exports/router',
  './exports/controller'
], function($, Backbone, Marionette, ExportsRouter, ExportsController){
  var App = new Marionette.Application();

  // Gets the LRS ID from the current url.
  App.lrs_id = window.location.pathname.split('lrs/')[1].split('/')[0];

  App.addRegions({
    content: '#content'
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
  
    // Start router.
    new ExportsRouter({
      controller: new ExportsController({
        app: App
      })
    });

    // Start history.
    if (Backbone.history){
      Backbone.history.start();
    }
  });
  
  return App;
});