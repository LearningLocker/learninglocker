define([
  'underscore',
  'backbone',
  'app',
  '../../../admin/models/site/StatsModel'
], function(_, Backbone, App, StatsModel ) {


  var TimelineModel = StatsModel.extend({
    urlRoot: function(){
      return window.LL.siteroot + '/lrs/' + App.lrs_id + '/stats';
    }
  });

  return TimelineModel;

});