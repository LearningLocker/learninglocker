define([
  './TypeAhead/CompositeView',
  './TypeAhead/ItemView'
], function (CompositeView, ItemView) {
  var getKeys = function (display) {
    // Sets display to default if not set.
    display = display || function (item) {
      var id = item.id
      return item.definition.name['en-GB'] + ' (' + id + ')';
    };

    return function (items, query) {
      return items.map(function (item) {
        return {value: display(item)};
      });
    };
  };
  var displayItem = function (item) {
    return item;
  };
  var displayActor = function (actor) {
    var mbox = actor.mbox && actor.mbox.replace('mailto:', '');
    var id = mbox || actor.account.href || actor.openId
    return actor.name + ' (' + id + ')';
  };
  var view = function (segment, display) {
    return CompositeView.extend({
      childView: ItemView.extend({
        typeaheadUrl: 'reporting/typeahead/' + segment,
        _getTypeaheadKeys: getKeys(display)
      })
    });
  };

  return {
    getKeys: getKeys,
    displayItem: displayItem,
    displayActor: displayActor,
    view: view
  };
});