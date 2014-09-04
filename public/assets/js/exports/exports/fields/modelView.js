define([
  'underscore',
  'marionette',
  'text!./modelTemplate.html',
  'typeahead'
], function (_, Marionette, template) {
  var substringMatcher = function(strs) {
    return function findMatches(query, cb) {
      var matches = [];
      var substrRegex = new RegExp(query, 'i');
   
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  };

  var keys = ['statement.id', 'statement.timestamp', 'statement.version', 'statement.actor.objectType', 'statement.actor.name', 'statement.actor.mbox', 'statement.actor.account.name', 'statement.actor.account.href', 'statement.actor.openid', 'statement.verb.id', 'statement.result.response', 'statement.object.objectType', 'statement.object.id', 'statement.object.definition.type', 'statement.authority.name', 'statement.authority.mbox', 'statement.authority.objectType', 'statement.stored'];

  return Marionette.ItemView.extend({
    template: _.template(template),
    tagName: 'li',
    ui: {
      from: '#from'
    },
    events: {
      'click #delete': 'delete',
      'change @ui.from': 'changeFrom',
      'change #to': 'changeTo'
    },

    onRender: function () {
      var self = this;

      this.ui.from.typeahead({
        minlength: 1
      }, {
        name: 'keys',
        displayKey: 'value',
        source: substringMatcher(keys, this)
      }).on(
        'typeahead:selected',
        this.changeFrom.bind(this)
      ).on(
        'typeahead:autocompleted',
        this.changeFrom.bind(this)
      );
    },

    changeFrom: function (e) {
      this.model.set({from: e.currentTarget.value});
    },

    changeTo: function (e) {
      this.model.set({to: e.currentTarget.value});
    },

    delete: function () {
      if (this.model.collection.length > 1) {
        this.model.destroy();
      } else {
        alert(trans('exporting.errors.noFields'));
      }
    }
  });
});