define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'layouts/main',
  'layouts/dashboard'
], function($,_, Backbone, Marionette, MainLayout, DashboardLayout){

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