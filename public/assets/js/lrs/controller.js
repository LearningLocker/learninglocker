define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'models/stats/StatsModel',
  'views/stats/stats',
  'views/stats/linegraph',
  'views/loadingView',
  'views/stats/header',
  'views/widget/userWidget',
  'views/widget/ActivitiesWidget',
  'views/widget/ButtonWidget'
], function($, _, Backbone, Marionette, App, StatsModel, Stats, LineGraph, 
  LoadingView, Header, UserWidget, ActivitiesWidget, ButtonWidget){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    //gets mapped to in AppRouter's appRoutes
    index:function () {

      //add our dashboard layout to the main app region
      App.layouts.main.mainRegion.show( App.layouts.dashboard );

      //find a better way to show loader
      App.layouts.dashboard.headerArea.show( new LoadingView );

      var stats = new StatsModel;
      stats.fetch().then(function() {

        console.log( stats );

        var headerView    = new Header({ model: stats });
        var lineGraphView = new LineGraph({ model: stats });
        var widgetView    = new UserWidget();
        var widgetView2    = new ActivitiesWidget({ model: stats });
        var widgetView3    = new ButtonWidget();

        //set content areas. E.g this could become widgets?
        App.layouts.dashboard.headerArea.show( headerView );
        App.layouts.dashboard.graphArea.show( lineGraphView );
        App.layouts.dashboard.contentOneArea.show( widgetView );
        App.layouts.dashboard.contentTwoArea.show( widgetView2 );
        App.layouts.dashboard.contentThreeArea.show( widgetView3 );

      });
      //App.layouts.dashboard.mainRegion.show( App.views.index );
    },


  });

  return Controller;

});