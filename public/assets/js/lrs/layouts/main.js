define([
  'marionette',
], function(Marionette){
  
  var Main = Backbone.Marionette.Layout.extend({
    template: "#dashboardTemplate",
    regions: {
      mainRegion: "#contents"
    }
  });

  return Main;
});