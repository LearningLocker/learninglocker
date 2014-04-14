define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'

], function($, _, Backbone, Marionette){

  var queryView = Backbone.Marionette.ItemView.extend({

    template:'#showQuery'

  });

  return queryView;

});