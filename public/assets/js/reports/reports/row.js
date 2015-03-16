define([
  'locker',
  './model',
  'text!./row.html'
], function(locker, Model, template) {
  return locker.ItemView.extend({
    model: Model,
    template: template
  });
});
