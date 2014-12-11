define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var end = new Date();
  var start = new Date();
  start.setMonth(end.getMonth() - 1);
  
  var StatsModel = Backbone.Model.extend({
    defaults:{
      statement_count: 0,
    },
    urlRoot: window.LL.siteroot + '/site/stats',
    parse: function(response){
      return _.isUndefined(response.stats) ? response : response.stats;
    },
    initialize: function(data, options){
      this.options = _.extend( this.options, options );
    },
    idAttribute: "_id"
  });

  return StatsModel;

});