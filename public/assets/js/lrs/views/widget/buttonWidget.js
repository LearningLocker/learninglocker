define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app'
], function($, _, Backbone, Marionette, App){

  var ButtonWidgetView = Backbone.Marionette.ItemView.extend({

    template:'#buttonWidget',

  });

  return ButtonWidgetView;

});