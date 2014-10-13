define([
  'locker',
  'text!./editLayout.html'
], function(Locker, template) {
  return Locker.LayoutView.extend({
    template: template
  });
});