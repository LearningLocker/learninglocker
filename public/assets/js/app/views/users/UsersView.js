define([
  'jquery',
  'underscore',
  'backbone',
  'models/user/UserModel',
  'collections/users/UsersCollection',
  'views/users/UserListView',
], function($, _, Backbone, UserModel, UsersColleciton, UserListView){

  var LrsView = Backbone.View.extend({ 
    tagName: 'table',
    className: 'table table-striped table-responsive',

    initialize: function(){
    },

    render: function(){
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne: function(user) {
      var userView = new UserListView({ model: user });
      this.$el.append(userView.render().el);
    }

  });

  return LrsView;

});