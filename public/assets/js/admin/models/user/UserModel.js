define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var UserModel = Backbone.Model.extend({
    urlRoot: 'users',
    idAttribute: "_id"
  });

  return UserModel;

});