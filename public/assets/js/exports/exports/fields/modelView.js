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

  // transcribed from https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#appendix-a-example-statements
  var properties = ['id', 'timestamp', 'version', 'actor.name', 'actor.mbox', 'actor.member', 'actor.objectType', 'actor.account.name', 'actor.account.href', 'actor.openid', 'verb.id', 'verb.display.en-GB', 'verb.display.en-US', 'authority.objectType', 'authority.name', 'authority.mbox', 'result.extensions', 'result.success', 'result.completion', 'result.response', 'result.duration', 'context.contextActivities', 'context.statement.objectType', 'context.statement.id', 'stored', 'object.id', 'object.definition.extensions', 'object.definition.name', 'object.definition.description', 'object.definition.type', 'object.objectType'];
  var keys = [];
  $.each(properties, function(index, value){keys.push('statement.' + value)});

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