define([
  'jquery',
  'underscore',
  'backbone',
  'models/oauthapp/OAuthAppModel',
  'collections/oauthapps/OAuthAppsCollection',
  'views/oauthapps/OAuthAppListView',
], function($, _, Backbone, OAuthAppModel, OAuthAppsColleciton, OAuthAppListView){

  var AppView = Backbone.View.extend({ 
    tagName: 'table',
    className: 'table table-striped table-responsive',

    initialize: function(){
    },

    render: function(){
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne: function(lrs) {
      var appView = new OAuthAppListView({ model: lrs });
      this.$el.append(appView.render().el);
    }

  });

  return AppView;

});