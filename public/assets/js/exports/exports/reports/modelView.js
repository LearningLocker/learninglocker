define([
  'underscore',
  'marionette',
  'text!./modelTemplate.html'
], function (_, Marionette, template) {
  return Marionette.ItemView.extend({
    template: _.template(template),
    tagName: 'option'
  });
});