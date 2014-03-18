define([
  'jquery',
  'underscore',
  'marionette',
  'vent',
], function($, _, Marionette, Vent){

  var Dashboard = Backbone.Marionette.Layout.extend({
    
    template:'#indexTemplate',

    regions: {
      headerArea: '#header',
      graphArea: "#graph",
      contentArea: '#contents'
    }
    
  });

  return Dashboard;
});