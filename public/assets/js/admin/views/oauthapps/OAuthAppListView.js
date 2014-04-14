define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/oauthapp/OAuthAppModel',
  'collections/oauthapps/OAuthAppsCollection'

], function($, _, Backbone, Marionette, OAuthAppModel, OAuthAppsCollection){

  var OAuthAppListView = Backbone.Marionette.ItemView.extend({

    template: '#appTemplate',
    tagName: 'tr',

    initialize: function() {
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);
    },

    events: {
    },

    unrender: function() {
      this.remove();
    }

  });

  return OAuthAppListView;

});