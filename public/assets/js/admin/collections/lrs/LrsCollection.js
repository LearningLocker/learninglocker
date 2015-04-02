define([
  'underscore',
  'backbone',
  'models/lrs/LrsModel'
], function( _, Backbone, LrsModel){

  var LrsCollection = Backbone.Collection.extend({
    model: LrsModel,
    url: 'site/lrs',
    comparator: function (model) {
      return model.get('title').toLowerCase();
    }
  });

  return LrsCollection;
});