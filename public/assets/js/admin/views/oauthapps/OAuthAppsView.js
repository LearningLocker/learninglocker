define([
  'jquery',
  'underscore',
  'backbone',
  'models/oauthapp/OAuthAppModel',
  'collections/oauthapps/OAuthAppsCollection',
  'views/oauthapps/OAuthAppListView',
], function($, _, Backbone, OAuthAppModel, OAuthAppsColleciton, OAuthAppListView){

  var AppView = Backbone.Marionette.CompositeView.extend({ 

    tagName: "table",
    className: 'table table-striped table-bordered table-responsive',
    template: "#appTable",
    itemView: OAuthAppListView,
    
    appendHtml: function(collectionView, itemView){
        collectionView.$("tbody").append(itemView.el);
    }

  });

  return AppView;

});