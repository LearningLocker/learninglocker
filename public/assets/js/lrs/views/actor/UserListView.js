define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/stats/UserModel',
  'collections/UserCollection'

], function($, _, Backbone, Marionette, UserModel, UserCollection){

  var UserListView = Backbone.Marionette.ItemView.extend({

    template:'#userListView',
    tagName: 'li',
    className: 'list-group-item'

  });

  return UserListView;

});