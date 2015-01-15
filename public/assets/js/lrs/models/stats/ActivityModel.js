define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  
  var ActivityModel = Backbone.Model.extend({
    urlRoot: function(){
      return window.LL.siteroot + '/lrs/' + App.lrs_id + '/stats/topActivities';
    },
    idAttribute: "_id"
  });

  return ActivityModel;

});