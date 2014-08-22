define([
  'marionette'
], function (Marionette) {
  return Marionette.LayoutView.extend({
    template: '#',
    regions: {
      'report': '#report',
      'fields': '#fields'
    }
  });
});