define([
  'jquery',
  'underscore',
  'marionette',
  'vent',
], function($, _, Marionette, Vent){

  var SettingsView = Backbone.Marionette.ItemView.extend({
    
    template: '#settingsTemplate',
    tagName: "div",
    className: "",

    // listen to DOM events
    events: {
    },
    
    // listen to application events
    initialize: function() {
    },
    
  });

  return SettingsView;
});