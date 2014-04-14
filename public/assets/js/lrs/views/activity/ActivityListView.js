define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/stats/ActivityModel',
  'collections/ActivityCollection'

], function($, _, Backbone, Marionette, ActivityModel, ActivityCollection){

  var ActivityListView = Backbone.Marionette.ItemView.extend({

    template:'#activityListView',
    tagName: 'li',
    className: 'list-group-item clearfix'

  });

  return ActivityListView;

});