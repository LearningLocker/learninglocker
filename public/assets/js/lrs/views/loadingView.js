define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'

], function($, _, Backbone, Marionette){

  var loadingView = Backbone.Marionette.ItemView.extend({

    template:'#showLoading'

  });

  return loadingView;

});