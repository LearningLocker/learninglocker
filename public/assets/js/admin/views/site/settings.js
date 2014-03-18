define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/site/SiteModel'

], function($, _, Backbone, Marionette, SiteModel){

  var SettingsView = Backbone.Marionette.CompositeView.extend({

    template:'#settingsTemplate',
    tagName: 'div',

    initialize: function() {
      this.model.on('change', this.render, this);
    },

    events: {
    }

  });

  return SettingsView;

});