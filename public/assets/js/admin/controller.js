define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'collections/lrs/LrsCollection',
  'views/lrs/LrsView',
  'collections/users/UsersCollection',
  'views/users/UsersView',
  'collections/oauthapps/OAuthAppsCollection',
  'views/oauthapps/OAuthAppsView',
  'models/site/SiteModel',
  'views/site/settings',
  'models/site/StatsModel',
  'views/stats/stats',
  'views/stats/header',
  'views/stats/linegraph',
  'views/site/loadingView',
  'views/lrs/addNew',
  'views/users/addNew',
  'views/site/edit'
], function($, _, Backbone, Marionette, App, LrsCollection, LrsView, UsersCollection, UsersView,
  OAuthAppsCollection, OAuthAppsView, SiteModel, Settings, StatsModel, Stats, Header, LineGraph, 
  LoadingView, AddNewLrs, AddNewUser, EditSettings){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    //gets mapped to in AppRouter's appRoutes
    index:function () {

      //find a better way to show loader
      App.layouts.main.mainRegion.show( new LoadingView );

      var stats = new StatsModel;
      stats.fetch().then(function() {

        var statsView     = new Stats({ model: stats });
        var headerView    = new Header({ model: stats });
        var lineGraphView = new LineGraph({ model: stats });

        //add our dashboard layout to the main app region
        App.layouts.main.mainRegion.show( App.layouts.dashboard );

        //set content areas. E.g this could become widgets?
        App.layouts.dashboard.headerArea.show( headerView );
        App.layouts.dashboard.graphArea.show( lineGraphView );
        App.layouts.dashboard.contentArea.show( statsView );

      });

    },

    settings:function () {
      var site = new SiteModel;
      var editSettings = new EditSettings({ model: site });
      site.fetch().then(function() {
        var settingsView = new Settings({ model: site });
        App.actionRegion.show( editSettings );
        App.layouts.main.mainRegion.show( settingsView );
      });
    },

    users:function () {

      var usersCol = new UsersCollection;
      var addNewUser = new AddNewUser;
      usersCol.fetch().then(function() {
        var userView = new UsersView({ collection: usersCol });
        App.actionRegion.show( addNewUser );
        App.layouts.main.mainRegion.show( userView );
      });

    },

    lrs:function () {
      //find a better way to show loader
      App.layouts.main.mainRegion.show( new LoadingView );
      var addNewLrs = new AddNewLrs;
      var lrsCol = new LrsCollection;
      lrsCol.fetch().then(function() {
        var lrsView = new LrsView({ collection: lrsCol });
        App.actionRegion.show( addNewLrs );
        App.layouts.main.mainRegion.show( lrsView );
      });

    },

    apps:function () {

      var appsCol = new OAuthAppsCollection;
      appsCol.fetch().then(function() {
        var appsView = new OAuthAppsView({ collection: appsCol });
        App.layouts.main.mainRegion.show( appsView );
      });

    },

  });

  return Controller;

});