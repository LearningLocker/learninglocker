define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'models/stats/TimelineModel',
  'models/stats/ActivityModel',
  'models/stats/UserModel',
  'models/ReportModel',
  'collections/ActivityCollection',
  'collections/UserCollection',
  'collections/ReportCollection',
  'views/stats/stats',
  'views/stats/lineGraph',
  'views/loadingView',
  'views/stats/header',
  'views/activity/ActivityList',
  'views/actor/UserList',
  'views/report/ReportList'
], function($, _, Backbone, Marionette, App, TimelineModel, ActivityModel, UserModel, ReportModel, ActivityCollection, UserCollection, 
    ReportCollection, Stats, LineGraph, LoadingView, Header, ActivityList, UserList, ReportList){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    index: function(){
      var query = window.location.pathname;
      var id = query.substr(-24);
      App.lrs_id = id;

      //add our dashboard layout to the main app region
      App.layouts.main.mainRegion.show( App.layouts.dashboard );

      //find a better way to show loader
      App.layouts.dashboard.graphArea.show( new LoadingView );

      var timeline = new TimelineModel;
      timeline.fetch().then(function() {

        var headerView    = new Header({ model: timeline });
        var lineGraphView = new LineGraph({ model: timeline });
        
        App.layouts.dashboard.headerArea.show( headerView );
        App.layouts.dashboard.graphArea.show( lineGraphView );
        
      });

      var activities = new ActivityCollection;
      activities.fetch().then(function() {

        var activityCol  = new ActivityList({ collection: activities });
        App.layouts.dashboard.contentTwoArea.show( activityCol );

      });

      var users = new UserCollection;
      users.fetch().then(function() {

        var userCol  = new UserList({ collection: users });
        App.layouts.dashboard.contentOneArea.show( userCol );

      });

      var reports = new ReportCollection;
      reports.fetch().then(function() {

        var reportCol  = new ReportList({ collection: reports });
        App.layouts.dashboard.contentThreeArea.show( reportCol );

      });
      
    },

    reporting: function(id){
      console.log( id );
    }


  });

  return Controller;

});