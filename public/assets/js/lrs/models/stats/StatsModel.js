define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var StatsModel = Backbone.Model.extend({
    urlRoot: '../lrs/52e6d85ee837a0640500002b/stats',
    idAttribute: "_id"
  });

  return StatsModel;

});