define([
  'underscore',
  'backbone',
  'models/stats/ActivityModel',
  'app'
], function( _, Backbone, ActivityModel, App){

  var ActivityCollection = Backbone.Collection.extend({
    model: ActivityModel,
    url: function(){
      return '../lrs/' + App.lrs_id + '/stats/topActivities';
    },
  });

  return ActivityCollection;
});