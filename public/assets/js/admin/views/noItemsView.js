define([
  'jquery',
  'underscore',
  'marionette', 
], function($, _, Marionette){
  var NoItemsView = Backbone.Marionette.ItemView.extend({
    template: '#noItemsView_template'
  });

  return NoItemsView;
});