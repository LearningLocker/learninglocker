define([
  'underscore',
  'backbone',
  'models/lrs/LrsModel'
], function( _, Backbone, LrsModel){

  var ActivitiesCollection = Backbone.Collection.extend({
    model: StatsModel
  });

  return ActivitiesCollection;
});