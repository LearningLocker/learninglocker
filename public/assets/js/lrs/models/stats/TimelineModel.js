define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  var end = new Date();
  var start = new Date();
  start.setMonth(end.getMonth() - 1);

  var TimelineModel = Backbone.Model.extend({

    //urlRoot: '../lrs/' + App.lrs_id + '/stats',
    urlRoot: function(){
      return '../lrs/' + App.lrs_id + '/stats';
    },
    idAttribute: "_id",
    defaults:{
      statement_graph: '',
      statement_count: 0,
      statement_avg: 0,
      actor_count: 0
    },
    options:{
      graphStartDate: start.toISOString().substr(0, 10),
      graphEndDate: end.toISOString().substr(0, 10)
    },
    initialize: function(data, options){
      this.options = _.extend( this.options, options );
    },
    updateStats: function(){
      return this.fetch({
        data: {
          graphStartDate: this.options.graphStartDate,
          graphEndDate: this.options.graphEndDate + ' 23:59'
        }
      });
    }
  });

  return TimelineModel;

});