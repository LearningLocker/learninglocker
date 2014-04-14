define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var StatsModel = Backbone.Model.extend({
    urlRoot: 'site/stats',
    idAttribute: "_id"
  });

  return StatsModel;

});