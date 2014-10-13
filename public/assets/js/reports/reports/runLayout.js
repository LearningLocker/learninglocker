define([
  'locker',
  'text!./runLayout.html'
], function(Locker, template) {
  return Locker.LayoutView.extend({
    template: template
  });
});