define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'bootstrap',
  'layouts/main',
  'layouts/dashboard'
], function($,_, Backbone, Marionette, Bootstrap, MainLayout, DashboardView){

  var App = new Backbone.Marionette.Application();
  
  App.layouts = {};
  App.collections = {};
  App.views = {};
  App.models = {};
  App.lrs_id = '';

  App.addRegions({
    pageRegion: '#appContainer'
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

    // init layouts
    App.layouts.main = new MainLayout();

    App.layouts.dashboard = new DashboardView();

    // set the master layout
    App.pageRegion.show(App.layouts.main);

    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});