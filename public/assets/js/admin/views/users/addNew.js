define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'

], function($, _, Backbone, Marionette){

  var addNewUser = Backbone.Marionette.ItemView.extend({

    template:'#addNewUser'

  });

  return addNewUser;

});