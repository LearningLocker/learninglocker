define('locker', [
  './ItemView',
  './LayoutView',
  './CompositeView',
  './Collection',
  './Model'
], function(ItemView, LayoutView, CompositeView, Collection, Model) {
  return {
    ItemView: ItemView,
    LayoutView: LayoutView,
    CompositeView: CompositeView,
    Collection: Collection,
    Model: Model
  };
});