define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/user/UserModel',
  'collections/users/UsersCollection'

], function($, _, Backbone, Marionette, UserModel, UsersCollection){

  var UserListView = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.unrender, this);
    },

    events: {
      'click div.verify': 'verifyUser',
      'click a.delete': 'deleteUser'
    },

    render: function() {
      var compiledTemplate = _.template( $( "#userTemplate" ).html(), this.model.toJSON() );
      this.$el.html( compiledTemplate );
      return this;
    },

    unrender: function() {
      this.remove();
    },

    deleteUser: function() {
      this.model.destroy();
      return false;
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