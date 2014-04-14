define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  
  var UserModel = Backbone.Model.extend({
    //urlRoot: '../lrs/' + App.lrs_id + '/stats/activeUsers',
    urlRoot: function(){
      return '../lrs/' + App.lrs_id + '/stats/activeUsers';
    },
    idAttribute: "_id"
  });

  return UserModel;

});