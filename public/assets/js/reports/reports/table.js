define([
  'locker',
  './row',
  'text!./table.html'
], function(locker, Row, template) {
  return locker.CompositeView.extend({
    childView: Row,
    template: template,
    _onCollectionAdd: function (child, collection, opts) {
      locker.CompositeView.prototype._onCollectionAdd.bind(this)(child, collection, opts);
      if (Object.keys(child.changed).length !== 0) {
        this.children.findByModel(child).$el.addClass('flash');
      }
      return this;
    }
  });
});