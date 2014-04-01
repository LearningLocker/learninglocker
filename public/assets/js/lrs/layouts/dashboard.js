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
      contentOneArea: '#active-users',
      contentTwoArea: '#popular-activities',
      contentThreeArea: '#latest-reports'
    }
    
  });

  return Dashboard;
});