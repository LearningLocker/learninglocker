define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var StatsModel = Backbone.Model.extend({
    defaults:{
      statement_graph: ""
    },
    options:{
      graphStartDate: "01-01-2014 00:00",
      graphEndDate: "01-12-2014 23:59"
    },
    parse: function(response){
      return response.stats;
    },
    initialize: function(data, options){
      this.options = _.extend( this.options, options );
    },
    url: function(){
      return 'site/stats';
    },
    idAttribute: "_id",
    updateStats: function(){
      return this.fetch({
        data: {
          graphStartDate: this.options.graphStartDate,
          graphEndDate: this.options.graphEndDate
        }
      });
    }
  });

  return StatsModel;

});