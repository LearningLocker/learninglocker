define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  
  var ReportModel = Backbone.Model.extend({
    urlRoot: function(){
      return '../lrs/' + App.lrs_id + '/reporting/getReports';
    },
    idAttribute: "_id"
  });

  return ReportModel;

});