define([
  'locker',
  './row',
  'text!./table.html'
], function(locker, Row, template) {
  return locker.CompositeView.extend({
    childView: Row,
    template: template
  });
});