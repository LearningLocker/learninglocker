define([
  'locker',
  './item',
  'text!./composite.html'
], function(locker, Item, template) {
  return locker.CompositeView.extend({
    childView: Item,
    template: template,
    nestedUrl: 'run'
  });
});