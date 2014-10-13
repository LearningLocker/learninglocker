define([
  'locker',
  './row',
  'text!./table.html'
], function(Locker, Row, template) {
  return Locker.CompositeView.extend({
    childView: Row,
    template: template
  });
});