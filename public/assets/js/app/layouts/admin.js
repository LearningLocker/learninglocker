define([
  'marionette',
], function(Marionette){
  
  var AdminLayout = Backbone.Marionette.Layout.extend({
    template: "#adminTemplate",
    regions: {
      mainRegion: "#contents"
    }
  });

  return AdminLayout;
});