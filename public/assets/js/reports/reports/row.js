define([
  'locker',
  './model',
  'text!./row.html'
], function(Locker, Model, template) {
  return Locker.ItemView.extend({
    model: Model,
    template: template
  });
});