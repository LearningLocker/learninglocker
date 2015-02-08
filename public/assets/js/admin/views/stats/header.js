define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'morris'

], function($, _, Backbone, Marionette, Morris){

  var HeaderView = Backbone.Marionette.ItemView.extend({

    template:'#dashboardHeader',

  });

  return HeaderView;

});