define([
  'backbone',
  'app'
], function(Backbone, App) {
  return Backbone.Model.extend({
    urlRoot: function(){
      //return '../lrs/' + App.lrs_id + '/reporting/getReports';
    },
    idAttribute: "_id"
  });
});