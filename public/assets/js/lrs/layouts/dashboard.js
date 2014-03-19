define([
  'jquery',
  'underscore',
  'marionette',
  'vent',
], function($, _, Marionette, Vent){

  var Dashboard = Backbone.Marionette.Layout.extend({
    
    template:'#dashboard',

    regions: {
      headerArea: '#header',
      graphArea: "#graph",
      contentOneArea: '#contents-one',
      contentTwoArea: '#contents-two',
      contentThreeArea: '#contents-three'
    }
    
  });

  return Dashboard;
});