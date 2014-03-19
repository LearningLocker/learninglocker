define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'layouts/main',
  'layouts/dashboard'
], function($,_, Backbone, Marionette, MainLayout, DashboardView){

  var App = new Backbone.Marionette.Application();
  
  App.layouts = {};
  App.collections = {};
  App.views = {};
  App.models = {};

  App.addRegions({
    pageRegion: '#appContainer'
  });

  App.addInitializer(function (options) {
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