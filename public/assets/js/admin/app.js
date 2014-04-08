define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'bootstrap',
  'layouts/main',
  'layouts/dashboard'
], function($,_, Backbone, Marionette, Bootstrap, MainLayout, DashboardLayout){

  var App = new Backbone.Marionette.Application();
  
  App.layouts = {};
  App.collections = {};
  App.views = {};
  App.models = {};

  App.addRegions({
    pageRegion: '#appContainer',
    actionRegion: '#actionContainer'
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

    // set site main layout
    App.layouts.main = new MainLayout();

    //set out dashboard layout
    App.layouts.dashboard = new DashboardLayout();

    // set the master layout
    App.pageRegion.show(App.layouts.main);

    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});