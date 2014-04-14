define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'

], function($, _, Backbone, Marionette){

  var addNewView = Backbone.Marionette.ItemView.extend({

    template:'#addNew'

  });

  return addNewView;

});