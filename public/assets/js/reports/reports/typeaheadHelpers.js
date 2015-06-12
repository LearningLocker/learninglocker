define([
  './Typeahead/CompositeView',
  './Typeahead/ItemView'
], function (CompositeView, ItemView) {
  var getKeys = function (display) {
    // Sets display to default if not set.
    display = display || function (item) {
      var id = item.id;
      var value = null;

      // Return a human-readable value if the browser defines languages.
      if (navigator.languages instanceof Array) {
        value = item.definition && item.definition.name && (navigator.languages.map(function (lang) {
          return item.definition.name[lang];
        }).filter(function (value) {
          return value != null;
        })[0] || (item.definition.name[Object.keys(item.definition.name)[0]]));
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
    var id= '';
    var pre = '';
    if (typeof actor.mbox !== "undefined") {
      id = actor.mbox;
    } else if (typeof actor.account !== "undefined" && typeof actor.account.name !== "undefined" && typeof actor.account.homePage !== "undefined") {
      id = actor.account.homePage + ' / ' + actor.account.name;
      pre = 'account:';
    } else if (typeof actor.openid !== "undefined") {
      id = actor.openid;
      pre = 'openid:';
    } else if (typeof actor.mbox_sha1sum !== "undefined") {
      id = actor.mbox_sha1sum;
      pre = 'mbox_sha1sum:';
    }
    return actor.name + ' (' + pre + id + ')';
  };
  var view = function (segment, type, example, display) {
    return CompositeView.extend({
      example: example,
      type: type,
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
