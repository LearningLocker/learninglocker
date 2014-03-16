define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'layouts/admin',
  'views/index'
], function($,_, Backbone, Marionette, AdminLayout, IndexView){

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
    App.layouts.admin = new AdminLayout();

    App.views.index = new IndexView();

    // set the master layout
    App.pageRegion.show(App.layouts.admin);

    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});