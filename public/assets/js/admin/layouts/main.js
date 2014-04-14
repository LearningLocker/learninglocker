define([
  'marionette',
], function(Marionette){
  
  var MainLayout = Backbone.Marionette.Layout.extend({
    template: "#mainTemplate",
    regions: {
      mainRegion: "#contents"
    }
  });

  return MainLayout;
});