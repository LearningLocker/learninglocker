define([
  'jquery',
  'underscore',
  'backbone',
  'models/ReportModel',
  'collections/ReportCollection',
  'views/report/ReportListView',
  'views/noItemsView'
], function($, _, Backbone, ReportModel, ReportColleciton, ReportListView, NoItemsView){

  var ReportView = Backbone.Marionette.CompositeView.extend({

    tagName: "ul",
    className: 'list-group',
    template: "#reportList",
    itemView: ReportListView,

    appendHtml: function(collectionView, itemView){
        collectionView.$("#recent").append(itemView.el);
    }

  });

  return ReportView;

});