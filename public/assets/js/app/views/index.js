define([
  'jquery',
  'underscore',
  'marionette',
  'vent',
], function($, _, Marionette, Vent){

  var IndexView = Backbone.Marionette.ItemView.extend({
    
    template: '#indexTemplate',
    tagName: "div",
    className: "",

    // listen to DOM events
    events: {
    },
    
    // listen to application events
    initialize: function() {
    },
    
  });

  return IndexView;
});