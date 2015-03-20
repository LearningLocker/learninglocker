define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    childView: ModelView,
    template: _.template(template),
    childViewContainer: '#exports',
    _onCollectionAdd: function (child, collection, opts) {
      Marionette.CompositeView.prototype._onCollectionAdd.bind(this)(child, collection, opts);
      if (Object.keys(child.changed).length !== 0) {
        this.children.findByModel(child).$el.addClass('flash');
      }
      return this;
    }
  });
});