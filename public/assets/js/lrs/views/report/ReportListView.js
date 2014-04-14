define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/ReportModel',
  'collections/ReportCollection'

], function($, _, Backbone, Marionette, UserModel, UserCollection){

  var ReportListView = Backbone.Marionette.ItemView.extend({

    template:'#reportListView',
    tagName: 'li',
    className: 'list-group-item'

  });

  return ReportListView;

});