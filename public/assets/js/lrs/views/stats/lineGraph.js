define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/stats/TimelineModel',
  'morris',
  'app'

], function($, _, Backbone, Marionette, TimelineModel, Morris, App){

  var LineGraphView = Backbone.Marionette.ItemView.extend({

    template:'#lineGraph',

    initialize: function(){
      this.model.on('change', this.render, this);
    },

    events: {
    },

    modelEvents: {
    },

    drawGraph: function(chartId, lineData) {

      var avg   = lineData.statement_avg;
      var data  = lineData.statement_graph;

      var totals   = 'Statement total';
      var learners = 'Learner total';

      //split the json string
      var details = data.split(' ');

      //iterate, convert to object and push to category_data
      var category_data = [];
      $.each(details , function(i, val) {
        category_data.push(jQuery.parseJSON( val ));
      });
        
      Morris.Line({
        element: chartId,
        data: category_data,
        xkey: 'y',
        goals: [avg],
        goalStrokeWidth: 2,
        goalLineColors: ['#00cc00'],
        barColors:['#354b59'],
        ykeys: ['a', 'b'],
        labels: [totals, learners]
      });

    },

    onShow: function(){
      this.drawGraph('morrisLine', this.model.toJSON());
    },

  });

  return LineGraphView;

});