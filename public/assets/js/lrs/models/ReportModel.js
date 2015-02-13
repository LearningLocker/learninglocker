define([
  'underscore',
  'backbone',
  'app',
  'basicauth'
], function(_, Backbone, App) {
  
  var ReportModel = Backbone.Model.extend({
    urlRoot: function(){
      return '../api/v1/reports';
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
    idAttribute: "_id"
  });

  return ReportModel;

});