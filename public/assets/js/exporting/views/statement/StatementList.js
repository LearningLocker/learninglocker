define([
  'jquery',
  'underscore',
  'backbone',
  'models/StatementModel',
  'collections/StatementCollection',
  'views/statement/StatementListView'
], function($, _, Backbone, StatementModel, StatementColleciton, StatementListView){

  var StatementList = Backbone.Marionette.CompositeView.extend({

    tagName: "ul",
    className: 'list-group',
    template: "#statementList",
    itemView: StatementListView,

    // appendHtml: function(collectionView, itemView){
    //     collectionView.$("#recent").append('hello');
    // }

  });

  return StatementList;

});