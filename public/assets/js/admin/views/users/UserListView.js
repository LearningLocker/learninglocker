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
      'click button.delete': 'deleteUser',
      'change select.role-select': 'changeRole',
    },

    unrender: function() {
      this.remove();
    },

    deleteUser: function() {
      if(confirm(trans('site.sure'))){
        this.model.destroy({});
      }
    },

    changeRole: function(element) {
      var user = $(element.target).attr('id');
      var role = $(element.target).val();
      var token = $('meta[name="token"]').attr('content');
      jQuery.ajax({
        url: 'users/update/role/' + user + '/' + role,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          $(element.target).blur();
          alert(trans('site.roleChange'));
        },
        error: function( error ) {
          console.log(error);
        }
      });
    },

    verifyUser: function(element){

      var user = $(element.target).data('id');

      jQuery.ajax({
        url: 'site/users/verify/' + user,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          console.log('success');
        },
        error: function( error ) {
          console.log('error');
        }
      });

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