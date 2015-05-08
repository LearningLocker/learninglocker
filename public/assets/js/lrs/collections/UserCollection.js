define([
  'underscore',
  'backbone',
  'models/stats/UserModel',
  'app'
], function( _, Backbone, UserModel, App){

  var UserCollection = Backbone.Collection.extend({
    model: UserModel,
    url: function(){
      return '../lrs/' + App.lrs_id + '/stats/activeUsers';
    },
    generateId: function (attrs) {
      return JSON.stringify(attrs._id);
    }
  });

  return UserCollection;
});