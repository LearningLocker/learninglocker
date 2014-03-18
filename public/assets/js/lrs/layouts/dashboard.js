define([
  'marionette',
], function(Marionette){
  
  var DashboardLayout = Backbone.Marionette.Layout.extend({
    template: "#dashboardTemplate",
    regions: {
      mainRegion: "#contents"
    }
  });

  return DashboardLayout;
});