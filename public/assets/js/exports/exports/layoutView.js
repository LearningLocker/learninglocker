define([
  'underscore',
  'marionette',
  'text!./layoutTemplate.html'
], function (_, Marionette, template) {
  return Marionette.LayoutView.extend({
    template: _.template(template),
    regions: {
      'report': '#report',
      'fields': '#fields',
      'exportInfo': '#exportInfo'
    }
  });
});