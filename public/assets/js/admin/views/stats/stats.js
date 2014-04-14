define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'models/site/StatsModel',
  'morris'

], function($, _, Backbone, Marionette, App, StatsModel, Morris){

  var StatsView = Backbone.Marionette.ItemView.extend({

    template:'#dashboardStats',

    initialize: function() {
      this.model.on('change', this.render, this);
    },

    events: {
      'request': 'showLoading',
      'sync': 'hideLoading'
    },

    showLoading: function() {
      this.$el.addClass('loading');
      alert('hello');
    },

  });

  return StatsView;

});