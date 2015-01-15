define([
  'marionette',
  'locker',
  './typeaheadHelpers',
  'text!./editLayout.html'
], function(marionette, locker, typeaheadHelpers, template) {
  // Helps with changing the query.
  var changeQuery = function (fn) {
    return function (e) {
      var query = this.model.get('query');
      e.stopPropagation();
      fn(query, e);
      this.model.set({query: query});
    };
  };
  var changeScore = function (field, min) {
    return changeQuery(function (query, e) {
      if (query[field] == null) {
        query[field] = ['<>', '', ''];
      }

      query[field][1 + !!min] = e.currentTarget.value;
    });
  };
  var clearQueryField = function (field) {
    return changeQuery(function (query, e) {
      $(e.currentTarget.parentElement).find('input').val(null).prop('checked', null);
      query[field] = undefined;
    });
  };
  var changeBoolean = function (field, value) {
    return changeQuery(function (query, e) {
      query[field] = e.currentTarget.checked ? value : !value;
    });
  };
  var changeDate = function (field) {
    return function (e) {
      var changes = {};
      changes[field] = e.currentTarget.value === '' ? undefined : new Date(e.currentTarget.value);
      this.model.set(changes);
      e.stopPropagation();
    };
  };


  // Helps with query initialisation.
  var initQueryProp = function (options) {
    return function (selector) {
      var lowKey =  selector + options.lowKey;
      var highKey = selector + options.highKey;
      var clearKey = selector + 'Clear';
      var field = options.field + selector;

      // Adds to UI.
      this.ui[lowKey] = '#' + selector + '-' + options.lowKey.toLowerCase();
      this.ui[highKey] = '#' + selector + '-' + options.highKey.toLowerCase();
      this.ui[clearKey] = '#' + selector + '-clear';

      // Adds events.
      this.events['change @ui.' + lowKey] = options.handler(field, false);
      this.events['change @ui.' + highKey] = options.handler(field, true);
      this.events['click @ui.' + clearKey] = clearQueryField(field);
    };
  };

  var booleanQuery = initQueryProp({
    lowKey: 'False',
    highKey: 'True',
    field: 'statement.result.',
    handler: changeBoolean
  });

  var scoreQuery = initQueryProp({
    lowKey: 'Min',
    highKey: 'Max',
    field: 'statement.result.score.',
    handler: changeScore
  });

  return locker.LayoutView.extend({
    ui: {},
    events: {
      // Toggles active class on tabs.
      'click a[data-toggle=\'tab\']': function (e) {
        $(e.currentTarget.parentElement.parentElement).find('.explore-option').removeClass('active');
        $(e.currentTarget).find('.explore-option').addClass('active');
      },
      'change #since': changeDate('since'),
      'change #until': changeDate('until')
    },
    template: template,
    initialize: function (options) {
      // Initalises scores and booleans.
      ['completion', 'success'].forEach(booleanQuery.bind(this));
      ['scaled', 'raw', 'min', 'max'].forEach(scoreQuery.bind(this));

      // Calls parent.
      return locker.LayoutView.prototype.initialize.call(this, options);
    },
    onRender: function (options) {
      // Renders initial values of radio buttons.
      // This is done here to reduce code duplication in the template.
      var query = this.model.get('query');
      var completion = query['statement.result.completion'];
      var success = query['statement.result.success'];
      this.ui.completionTrue.prop('checked', completion === true ? true : undefined);
      this.ui.completionFalse.prop('checked', completion === false ? true : undefined);
      this.ui.successTrue.prop('checked', success === true ? true : undefined);
      this.ui.successFalse.prop('checked', success === false ? true : undefined);

      // Calls parent.
      return locker.LayoutView.prototype.onRender.call(this, options);
    },
    relations: {
      actors: typeaheadHelpers.view('actors', 'Actor', 'Search for the actor by typing their name (i.e. "Bob")', typeaheadHelpers.displayActor),
      verbs: typeaheadHelpers.view('verbs', 'Verb', 'Search for the verb by typing it&#39;s name here (i.e. "completed")', function (item) {
        var id = item.id
        return item.display['en-GB'] + ' (' + id + ')';
      }),
      activities: typeaheadHelpers.view('activities', 'Activity', 'Search for the activity by typing it&#39;s url identifier (i.e. "www.example.com/activity/1")'),
      activityTypes: typeaheadHelpers.view('activityTypes', 'Activity Type', 'Search for the activity type by typing it&#39;s url identifier (i.e. "www.example.com/activity-type/1")', typeaheadHelpers.displayItem),
      parents: typeaheadHelpers.view('parents', 'Parent Activity', 'Search for the activity by typing it&#39;s url identifier (i.e. "www.example.com/activity/1")'),
      groups: typeaheadHelpers.view('grouping', 'Grouping Activity', 'Search for the activity by typing it&#39;s url identifier (i.e. "www.example.com/activity/1")'),
      platforms: typeaheadHelpers.view('platforms', 'Platform', 'Search for the platform by typing it&#39;s name (i.e. "Curatr")', typeaheadHelpers.displayItem),
      instructors: typeaheadHelpers.view('instructors', 'Instructor', 'Search for the instructor by typing their name (i.e. "Bob")', typeaheadHelpers.displayActor),
      languages: typeaheadHelpers.view('languages', 'Language', 'Search for the language by typing it here (i.e. "English")', typeaheadHelpers.displayItem)
    }
  });
});
