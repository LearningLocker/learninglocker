define([
  'backbone',
  'marionette',
  'beagle',
  './reports/router',
  './reports/collection'
], function(backbone, Marionette, beagle, ReportsRouter, ReportsCollection) {
  var App = new Marionette.Application();

  // Gets the LRS ID from the current url.
  window.lrsId = window.location.pathname.split('lrs/')[1].split('/')[0];

  App.addRegions({
    content: '#content'
  });

  App.addInitializer(function(options) {
    beagle.walk(ReportsRouter, {
      app: App,
      url: '../../api/v1'
    });
  });
  
  return App;
});