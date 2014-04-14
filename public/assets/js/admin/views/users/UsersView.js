define([
  'jquery',
  'underscore',
  'backbone',
  'models/user/UserModel',
  'collections/users/UsersCollection',
  'views/users/UserListView',
], function($, _, Backbone, UserModel, UsersColleciton, UserListView){

  var UserView = Backbone.Marionette.CompositeView.extend({

    tagName: "table",
    className: 'table table-striped table-bordered table-responsive',
    template: "#userTable",
    itemView: UserListView,
    
    appendHtml: function(collectionView, itemView){
        collectionView.$("tbody").append(itemView.el);
    }

  });

  return UserView;

});