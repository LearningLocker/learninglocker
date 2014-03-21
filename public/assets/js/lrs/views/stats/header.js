define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/stats/TimelineModel',
  'morris'

], function($, _, Backbone, Marionette, TimelineModel, Morris){

  var HeaderView = Backbone.Marionette.ItemView.extend({

    template:'#dashboardHeader'

  });

  return HeaderView;

});