define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var OAuthAppModel = Backbone.Model.extend({
    urlRoot: 'oauth/app',
    idAttribute: "_id"
  });

  return OAuthAppModel;

});