define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app'
], function($, _, Backbone, Marionette, App){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    //gets mapped to in AppRouter's appRoutes
    index:function () {
      App.layouts.dashboard.mainRegion.show( App.views.index );
    },


  });

  return Controller;

});