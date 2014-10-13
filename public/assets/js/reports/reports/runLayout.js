define([
  'locker',
  'text!./runLayout.html'
], function(locker, template) {
  return locker.LayoutView.extend({
    template: template
  });
});