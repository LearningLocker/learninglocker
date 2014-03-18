define([
  'jquery',
  'underscore',
  'backbone',
  'models/lrs/LrsModel',
  'collections/lrs/LrsCollection',
  'views/lrs/LrsListView',
  'views/noItemsView'
], function($, _, Backbone, LrsModel, LrsColleciton, LrsListView, NoItemsView){

  var LrsView = Backbone.Marionette.CompositeView.extend({

    tagName: "table",
    className: 'table table-striped table-bordered table-responsive',
    template: "#lrsTable",
    itemView: LrsListView,
    
    appendHtml: function(collectionView, itemView){
        collectionView.$("tbody").append(itemView.el);
    }


  });

  return LrsView;

});