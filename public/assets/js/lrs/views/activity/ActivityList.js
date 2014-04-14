define([
  'jquery',
  'underscore',
  'backbone',
  'models/stats/ActivityModel',
  'collections/ActivityCollection',
  'views/activity/ActivityListView',
  'views/noItemsView'
], function($, _, Backbone, ActivityModel, ActivityColleciton, ActivityListView, NoItemsView){

  var ActivityView = Backbone.Marionette.CompositeView.extend({

    tagName: "ul",
    className: 'list-group',
    template: "#activityList",
    itemView: ActivityListView,

    appendHtml: function(collectionView, itemView){
        collectionView.$("#popular-activities").append(itemView.el);
    }

  });

  return ActivityView;

});