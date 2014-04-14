define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  
  var StatementModel = Backbone.Model.extend({
    urlRoot: function(){
      //return '../lrs/' + App.lrs_id + '/reporting/getReports';
    },
    idAttribute: "_id"
  });

  return StatementModel;

});