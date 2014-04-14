define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/StatementModel',
  'collections/StatementCollection'

], function($, _, Backbone, Marionette, StatementModel, StatementCollection){

  var StatementListView = Backbone.Marionette.ItemView.extend({

    template:'#statementListView',
    tagName: 'li',
    className: 'list-group-item'

  });

  return StatementListView;

});