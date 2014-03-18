define([
  'underscore',
  'backbone',
  'models/user/UserModel'
], function(_, Backbone, UserModel){

  var UsersCollection = Backbone.Collection.extend({
    model: UserModel,
    url: 'site/users'
  });

  return UsersCollection;
});