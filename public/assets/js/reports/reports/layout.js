define([
  'locker',
  'text!./layout.html'
], function(Locker, template) {
  return Locker.LayoutView.extend({
    template: template
  });
});