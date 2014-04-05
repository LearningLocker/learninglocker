define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/user/UserModel',
  'collections/users/UsersCollection'

], function($, _, Backbone, Marionette, UserModel, UsersCollection){

  var UserListView = Backbone.Marionette.ItemView.extend({

    template:'#userTemplate',
    tagName: 'tr',

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.unrender, this);
    },

    events: {
      'click div.verify': 'verifyUser',
      'click button.delete': 'deleteUser'
    },

    unrender: function() {
      this.remove();
    },

    deleteUser: function() {
      confirm = confirm('Are you sure?');
      if( confirm == true ){
        this.model.destroy({});
      }
    },

    verifyUser: function(element){

      if($(element.target).hasClass("label-default")) {
        $(element.target).removeClass("label-default");
        $(element.target).addClass("label-success");
        $(element.target).children().removeClass("icon-check-empty");
        $(element.target).children().addClass("icon-check");
      }else{
        $(element.target).children().removeClass("icon-check");
        $(element.target).children().addClass("icon-check-empty");
        $(element.target).removeClass("label-success");
        $(element.target).addClass("label-default");
      }
      
    }

  });

  return UserListView;

});