define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'datepicker',
  'datepicker_custom',
  'app',
  'lib/reporting',
  'collections/StatementCollection',
  'models/StatementModel',
  'views/statement/StatementList'
], function($, _, Backbone, Marionette, Datepicker, DatepickerCustom, App, Reporting, StatementCollection, 
  StatementModel, StatementList){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    index: function(){

    },


  });

  return Controller;

});