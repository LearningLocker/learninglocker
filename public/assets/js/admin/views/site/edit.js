define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'
], function($, _, Backbone, Marionette){

  var edit = Backbone.Marionette.ItemView.extend({

    template:'#editSettings'

  });

  return edit;

});