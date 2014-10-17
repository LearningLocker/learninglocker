define([
  'locker',
  './model',
  'text!./item.html'
], function(locker, Model, template) {
  return locker.ItemView.extend({
    model: Model,
    template: template
  });
});