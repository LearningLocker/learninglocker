define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'layouts/dashboard',
  'views/index'
], function($,_, Backbone, Marionette, DashboardLayout, IndexView){

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
    App.layouts.dashboard = new DashboardLayout();

    App.views.index = new IndexView();

    // set the master layout
    App.pageRegion.show(App.layouts.dashboard);

    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});