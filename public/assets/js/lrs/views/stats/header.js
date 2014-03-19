define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/stats/StatsModel',
  'morris'

], function($, _, Backbone, Marionette, StatsModel, Morris){

  var HeaderView = Backbone.Marionette.ItemView.extend({

    template:'#dashboardHeader',

  });

  return HeaderView;

});