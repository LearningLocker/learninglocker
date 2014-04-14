define([
  'underscore',
  'backbone',
  'models/ReportModel',
  'app'
], function( _, Backbone, ReportModel, App){

  var ReportCollection = Backbone.Collection.extend({
    model: ReportModel,
    url: function(){
      return '../lrs/' + App.lrs_id + '/reporting/getReports';
    },
  });

  return ReportCollection;
});