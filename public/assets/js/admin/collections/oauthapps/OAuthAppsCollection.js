define([
  'underscore',
  'backbone',
  'models/oauthapp/OAuthAppModel'
], function(_, Backbone, OAuthAppModel){

  var OAuthAppCollection = Backbone.Collection.extend({
    model: OAuthAppModel,
    url: 'site/apps'
  });

  return OAuthAppCollection;
});