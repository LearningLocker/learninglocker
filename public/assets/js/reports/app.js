define([
  'backbone',
  'marionette',
  'beagle',
  './reports/router',
  './reports/collection'
], function(Backbone, Marionette, beagle, ReportsRouter, ReportsCollection) {
  var App = new Marionette.Application();

  // Gets the LRS ID from the current url.
  App.lrs_id = window.location.pathname.split('lrs/')[1].split('/')[0];

  App.addRegions({
    content: '#content'
  });

  App.addInitializer(function(options) {
    beagle.walk(ReportsRouter, {
      app: App,
      url: '../../api/v1',
      collection: new ReportsCollection
    });
  });
  
  return App;
});