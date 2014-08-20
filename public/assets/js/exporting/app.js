define([
  'jquery',
  'backbone',
  'marionette',
  'controller'
], function($, Backbone, Marionette, AppController){

  var App = new Marionette.Application();
  
  App.layouts = {};
  App.collections = {};
  App.views = {};
  App.models = {};

  App.appRouter = new Marionette.AppRouter.extend({
    controller: new AppController(),
    appRoutes: {
      '': 'index'
    }
  });

  // Gets the current LRS ID.
  App.lrs_id = window.location.pathname.split('lrs/')[1].split('/')[0];

  App.addRegions({
    pageRegion: '#statements'
  });

  App.addInitializer(function (options) {

    //add our csrf token to every ajax request
    $.ajaxPrefilter(function(options, originalOptions, jqXHR){
      var token;
      if( !options.crossDomain ){
        token = $('meta[name="token"]').attr('content');
        if( token ){
          return jqXHR.setRequestHeader('X-CSRF-Token', token);
        }
      }
    });
  
    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});