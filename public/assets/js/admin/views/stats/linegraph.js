define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'morris'

], function($, _, Backbone, Marionette, Morris){

  var LineGraphView = Backbone.Marionette.ItemView.extend({

    template:'#lineGraph',

    initialize: function(){
      this.listenTo( this.model, 'sync', this.render );
    },

    events:{
      'submit #dateRange' : 'startupdate'
    },

    ui:{
      'startDateInput':'#startDateInput', 
      'endDateInput':'#endDateInput',
      'morrisLine' : '#morrisLine'
    },

    startupdate: function(e){
      e.preventDefault();
      this.updateGraph();
    },

    updateGraph: function(){
      this.ui.morrisLine.css({height: "auto"});
      var $img = $('<img/>').attr('src', window.LL.siteroot + "/assets/img/ajax-loader.gif" );
      this.ui.morrisLine.html($img);
      this.model.options.graphStartDate = this.ui.startDateInput.val();
      this.model.options.graphEndDate = this.ui.endDateInput.val();
      this.model.updateStats();
    },

    templateHelpers: function(){
      var model = this.model;

      return {
        dates: function () {
          return {
            start : model.options.graphStartDate,
            end : model.options.graphEndDate
          };
        }
      };
    },

    drawGraph: function(chartElement) {
      var chartId = chartElement.attr('id');

      if( $('#'+chartId).length > 0 ){

        var data  = this.model.get("statement_graph");

        var totals   = 'Statement total';
        var learners = 'Learner total';

        if( data.length > 0 ){
          //split the json string
          var details = data.split(' ');

          //iterate, convert to object and push to category_data
          var category_data = [];
          $.each(details , function(i, val) {
            category_data.push($.parseJSON( val ));
          });

          this.ui.morrisLine.css({height: "350px"});
          
          Morris.Line({
            element: chartId,
            data: category_data,
            xkey: 'y',
            barColors:['#354b59'],
            ykeys: ['a', 'b'],
            labels: [totals, learners]
          });
        }
      }

    },
    redraw: function(){
      this.drawGraph( this.ui.morrisLine );
    },
    onShow: function () {
      this.updateGraph();
    },
    onRender: function(){
      this.redraw();
    }

  });

  return LineGraphView;

});