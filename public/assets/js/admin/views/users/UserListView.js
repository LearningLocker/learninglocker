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
      'click button.reset': 'resetUserPassword',
      'change select.role-select': 'changeRole',
    },

    unrender: function() {
      this.remove();
    },

    resetUserPassword: function () {
      $.get('users/'+this.model.id+'/reset/password', null, function (data) {
        prompt('Send this URL to '+this.model.get('name')+' so they can reset their password.', data);
      }.bind(this));
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

    styleCheckbox: function (target) {
      return function (json) {
        var checkboxClicked = target.data('id') ? false : true;
        if(checkboxClicked) {
          if(target.parent().hasClass("label-default")) {
            target.parent().removeClass("label-default");
            target.parent().addClass("label-success");
            target.removeClass("icon-check-empty");
            target.addClass("icon-check");
          }else if(target.parent().hasClass("label-success")) {
            target.parent().removeClass("label-success");
            target.parent().addClass("label-default");
            target.removeClass("icon-check");
            target.addClass("icon-check-empty");
          }
        }else{
          if(target.hasClass("label-default")) {
            target.removeClass("label-default");
            target.addClass("label-success");
            target.children().removeClass("icon-check-empty");
            target.children().addClass("icon-check");
          }else if(target.hasClass("label-success")) {
            target.removeClass("label-success");
            target.addClass("label-default");
            target.children().removeClass("icon-check");
            target.children().addClass("icon-check-empty");
          }
        }
      }.bind(this);
      //console.log('success');
    },

    verifyUser: function(element){
      var target = $(element.target)
      var user = target.data('id') || target.parent().data('id');
      jQuery.ajax({
        url: 'site/users/verify/' + user,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        success: this.styleCheckbox(target),
        error: function( error ) {
          console.log('error');
        }
      });
    }

  });

  return UserListView;

});
