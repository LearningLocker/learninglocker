define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/site/SiteModel'

], function($, _, Backbone, Marionette, SiteModel){

  var SettingsView = Backbone.Marionette.CompositeView.extend({

    tagName: 'div',

    initialize: function() {
      console.log( this.model );
      this.model.on('change', this.render, this);
    },

    events: {
    },

    render: function() {
      var compiledTemplate = _.template( $( "#settingsTemplate" ).html(), this.model.toJSON() );
      this.$el.html( compiledTemplate );
      return this;
    }

  });

  return SettingsView;

});