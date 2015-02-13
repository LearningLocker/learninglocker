define([
  'underscore',
  'backbone',
  'models/ReportModel',
  'app',
  'basicauth'
], function( _, Backbone, ReportModel, App){

  var ReportCollection = Backbone.Collection.extend({
    model: ReportModel,
    url: function(){
      return '../api/v1/reports';
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    }
  });

  return ReportCollection;
});