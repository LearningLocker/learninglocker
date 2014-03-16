define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'views/settings',
  'collections/lrs/LrsCollection',
  'views/lrs/LrsView',
  'collections/users/UsersCollection',
  'views/users/UsersView',
  'collections/oauthapps/OAuthAppsCollection',
  'views/oauthapps/OAuthAppsView',
  'models/site/SiteModel',
  'views/site/settings'
], function($, _, Backbone, Marionette, App, 
  SettingsView, LrsCollection, LrsView, UsersCollection, UsersView,
  OAuthAppsCollection, OAuthAppsView, SiteModel, Settings){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    //gets mapped to in AppRouter's appRoutes
    index:function () {
      App.layouts.admin.mainRegion.show(App.views.index);
    },

    settings:function () {
      var site = new SiteModel;
      site.fetch().then(function() {
        var settingsView = new Settings({ model: site });
        App.layouts.admin.mainRegion.show( settingsView );
      });
    },

    users:function () {

      var usersCol = new UsersCollection;
      usersCol.fetch().then(function() {
        var userView = new UsersView({ collection: usersCol });
        App.layouts.admin.mainRegion.show( userView );
      });

    },

    lrs:function () {

      var lrsCol = new LrsCollection;
      lrsCol.fetch().then(function() {
        var lrsView = new LrsView({ collection: lrsCol });
        App.layouts.admin.mainRegion.show( lrsView );
      });

    },

    apps:function () {

      var appsCol = new OAuthAppsCollection;
      appsCol.fetch().then(function() {
        var appsView = new OAuthAppsView({ collection: appsCol });
        App.layouts.admin.mainRegion.show( appsView );
      });

    },

  });

  return Controller;

});