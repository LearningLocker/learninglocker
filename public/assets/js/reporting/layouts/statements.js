define([
  'jquery',
  'underscore',
  'marionette',
  'vent',
], function($, _, Marionette, Vent){

  var Statements = Backbone.Marionette.Layout.extend({
    
    template:'#statements',

    regions: {
      statementArea: '#statements',
    }
    
  });

  return Statements;
});