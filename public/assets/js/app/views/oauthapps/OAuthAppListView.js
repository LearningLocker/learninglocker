define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/oauthapp/OAuthAppModel',
  'collections/oauthapps/OAuthAppsCollection'

], function($, _, Backbone, Marionette, OAuthAppModel, OAuthAppsCollection){

  var OAuthAppListView = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',

    initialize: function() {
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);
    },

    events: {
    },

    render: function() {
      var compiledTemplate = _.template( $( "#appTemplate" ).html(), this.model.toJSON() );
      this.$el.html( compiledTemplate );
      return this;
    },

    unrender: function() {
      this.remove();
    }

  });

  return OAuthAppListView;

});