define([
  './TypeAhead/CompositeView',
  './TypeAhead/ItemView'
], function (CompositeView, ItemView) {
  var getKeys = function (display) {
    // Sets display to default if not set.
    display = display || function (item) {
      var id = item.id;
      var value = null;

      // Return a human-readable value if the browsers defines languages.
      if (navigator.languages instanceof Array) {
        var value = navigator.languages.map(function (lang) {
          return item.definition && item.definition.name && item.definition.name[lang];
        }).filter(function (value) {
          return value != null;
        })[0];
      }

      // Display human-readable value if it exists
      if (value != null) {
        return value + ' (' + id + ')';
      }

      // Otherwise display just the identifier.
      else {
        return id;
      }
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
    var id = actor.mbox || actor.account.href || actor.openId
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