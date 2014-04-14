define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var LrsModel = Backbone.Model.extend({
    urlRoot: 'lrs',
    idAttribute: "_id"
  });

  return LrsModel;

});