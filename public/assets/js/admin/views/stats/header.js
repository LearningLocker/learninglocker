define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/site/StatsModel',
  'morris'

], function($, _, Backbone, Marionette, StatsModel, Morris){

  var HeaderView = Backbone.Marionette.ItemView.extend({

    template:'#dashboardHeader',

  });

  return HeaderView;

});