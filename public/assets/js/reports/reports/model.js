define([
  'locker',
  'backbone',
  './Typeahead/Collection',
  'basicauth'
], function(locker, backbone, TypeAheadCollection) {
  return locker.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: null,
      name: 'New report',
      description: 'Description of the new report.',
      lrs: window.lrsId,
      query: {},
      since: undefined,
      until: undefined
    },
    relations: {
      actors: TypeAheadCollection,
      verbs: TypeAheadCollection,
      activities: TypeAheadCollection,
      activityTypes: TypeAheadCollection,
      parents: TypeAheadCollection,
      groups: TypeAheadCollection,
      platforms: TypeAheadCollection,
      instructors: TypeAheadCollection,
      languages: TypeAheadCollection
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
    _queryResponseMap: {
      'actor.mbox': 'actors',
      'verb.id': 'verbs',
      'object.definition.type': 'activities',
      'object.id': 'activityTypes',
      'context.contextActivities.parent.id': 'parents',
      'context.contextActivities.grouping.id': 'groups',
      'context.platform': 'platforms',
      'context.instructor': 'instructors',
      'context.language': 'languages'
    },
    _mapQueryToResponse: function (query, response) {
      Object.keys(this._queryResponseMap).forEach(function (queryKey) {
        var responseKey = this._queryResponseMap[queryKey];
        queryKey = 'statement.' + queryKey;
        response[responseKey] = query[queryKey];
      }.bind(this));
    },
    _mapResponseToQuery: function () {
      var query = this.get('query');
      Object.keys(this._queryResponseMap).forEach(function (queryKey) {
        var responseKey = this._queryResponseMap[queryKey];
        var newValue = this.get(responseKey).map(function (model) {
          var value = model.get('value');

          // Sets value to the full value if there is no identifier in brackets.
          if (value.indexOf('(') === -1) {
            value = value;
          }

          // Sets value to the identifier from between brackets if it exists.
          else {
            value =  value.split('(').pop().slice(0, -1);
          }

          return value;
        });
        query['statement.' + queryKey] = newValue.length > 0 ? newValue : undefined;
      }.bind(this));
    },
    _initializeRelations: function (response, empty) {
      // Maps query relations to response.
      if (!empty && response.query) {
        this._mapQueryToResponse(response.query, response);
      } else {
        response.query = {};
      }

      // Calls parent to initialise relations.
      response = locker.Model.prototype._initializeRelations.bind(this)(response, empty);

      return response;
    },
    sync: function (method, model, options) {
      if (method === 'update') {
        this._mapResponseToQuery();
        return locker.Model.prototype.sync.call(this, method, model, options);
      } else {
        return locker.Model.prototype.sync.call(this, method, model, options);
      }
    }
  });
});