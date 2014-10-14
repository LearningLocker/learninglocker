define([
  'marionette',
  'locker',
  './TypeAhead/ItemView',
  './TypeAhead/CompositeView',
  'text!./editLayout.html'
], function(marionette, locker, TypeaheadItem, TypeaheadComposite, template) {
  var changeQuery = function (fn) {
    return function (e) {
      var query = this.model.get('query') || {};
      e.stopPropagation();
      query = fn(query, e);
      this.model.set({query: query});
    };
  };
  var changeScore = function (field, min) {
    return changeQuery(function (query, e) {
      if (query[field] == null) {
        query[field] = ['<>', '', ''];
      }

      query[field][!!min + 2] = e.currentTarget.value;
    });
  };
  var clearQueryField = function (field) {
    return changeQuery(function (query, e) {
      query[field] = null;
    });
  };
  var changeBoolean = function (field, value) {
    return changeQuery(function (query, e) {
      query[field] = e.currentTarget.value === value;
    });
  };

  return locker.LayoutView.extend({
    template: template,
    events: {
      'change #since': 'bla',
      'change #until': 'bla',

      // Success/Completion.
      'change #completion-true': changeBoolean('statement.result.completion', true),
      'change #completion-false': changeBoolean('statement.result.completion', false),
      'click #completion-clear': clearQueryField('statement.result.completion'),
      'change #success-true': changeBoolean('statement.result.completion', true),
      'change #success-false': changeBoolean('statement.result.completion', false),
      'click #success-clear': clearQueryField('statement.result.success'),

      // 
      'change #scaled-min': changeScore('statement.result.score.scaled', false),
      'change #scaled-max': changeScore('statement.result.score.scaled', true),
      'click #scaled-clear': clearQueryField('statement.result.score.scaled'),
      'change #raw-min': changeScore('statement.result.score.raw', false),
      'change #raw-max': changeScore('statement.result.score.raw', true),
      'click #raw-clear': clearQueryField('statement.result.score.raw'),
      'change #min-min': changeScore('statement.result.score.min', false),
      'change #min-max': changeScore('statement.result.score.min', true),
      'click #min-clear': clearQueryField('statement.result.score.min'),
      'change #max-min': changeScore('statement.result.score.max', false),
      'change #max-max': changeScore('statement.result.score.max', true),
      'click #max-clear': clearQueryField('statement.result.score.max'),
    },
    relations: {
      actors: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      verbs: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activities: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activityTypes: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      parents: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      groups: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      platforms: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      instructors: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      languages: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      })
    }
  });
});