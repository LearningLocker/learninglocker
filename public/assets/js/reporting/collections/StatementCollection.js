define([
  'underscore',
  'backbone',
  'models/StatementModel',
  'app'
], function( _, Backbone, StatementModel, App){

  var StatementCollection = Backbone.Collection.extend({
    model: StatementModel,
    url: function(){
      //return '../lrs/' + App.lrs_id + '/reporting/getReports';
    },
  });

  return StatementCollection;
});