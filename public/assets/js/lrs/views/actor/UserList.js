define([
  'jquery',
  'underscore',
  'backbone',
  'models/stats/UserModel',
  'collections/UserCollection',
  'views/actor/UserListView',
  'views/noItemsView'
], function($, _, Backbone, UserModel, UserColleciton, UserListView, NoItemsView){

  var UserView = Backbone.Marionette.CompositeView.extend({

    tagName: "ul",
    className: 'list-group',
    template: "#userList",
    itemView: UserListView,

    appendHtml: function(collectionView, itemView){
      collectionView.$("#active").append(itemView.el);
    }

  });

  return UserView;

});