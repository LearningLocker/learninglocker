define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app',
  'lib/reporting',
  'collections/StatementCollection',
  'models/StatementModel',
  'views/statement/StatementList',
], function($, _, Backbone, Marionette, App, Reporting, StatementCollection, StatementModel, StatementList){

  var Controller = Backbone.Marionette.Controller.extend({

    initialize:function (options) {
    },

    index: function(){

    
      //var stateCol = new StatementList({ collection: '' });
      //App.pageRegion.show(stateCol);


    },


  });

  return Controller;

});