define([
  'locker',
  'backbone',
  './TypeAhead/Collection',
  'basicauth'
], function(locker, backbone, TypeAheadCollection) {
  return locker.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: null,
      name: 'New report',
      description: 'Description of the new report.',
      lrs: window.lrsId,
      query: {
        since: null,
        until: null
      }
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
    _mapResponseToQuery: function (query, response) {
      Object.keys(this._queryResponseMap).forEach(function (queryKey) {
        var responseKey = this._queryResponseMap[queryKey];
        queryKey = 'statement.' + queryKey;
        query[queryKey] = response[responseKey];
      }.bind(this));
    },
    _initializeRelations: function (response, empty) {
      // Maps query relations to response.
      if (!empty && response.query) {
        var query = response.query;
        this._mapQueryToResponse(query, response);
      } else {
        response.query = {};
      }

      // Calls parent to initialise relations.
      var result = locker.Model.prototype._initializeRelations.bind(this)(response, empty);

      // Maps reponse collections to query.
      this._mapResponseToQuery(query || {}, response);

      return result;
    }
  });
});