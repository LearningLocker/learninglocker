define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var end = new Date();
  var start = new Date();
  start.setMonth(end.getMonth() - 1);
  
  var StatsModel = Backbone.Model.extend({
    defaults:{
      statement_graph: ''
    },
    urlRoot: 'site/stats',
    options:{
      graphStartDate: start.toISOString().substr(0, 10),
      graphEndDate: end.toISOString().substr(0, 10)
    },
    parse: function(response){
      return response.stats;
    },
    initialize: function(data, options){
      this.options = _.extend( this.options, options );
    },
    idAttribute: "_id",
    updateStats: function(){
      return this.fetch({
        data: {
          graphStartDate: this.options.graphStartDate,
          graphEndDate: this.options.graphEndDate + ' 23:59'
        }
      });
    }
  });

  return StatsModel;

});