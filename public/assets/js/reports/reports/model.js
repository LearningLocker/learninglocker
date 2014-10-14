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
      name: null,
      description: null,
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
    _initializeRelations: function (response, empty) {
      // Maps relations in query.
      if (!empty && response.query) {
        var query = response.query;
        response.actors = query['statement.actor.mbox'];
        response.verbs = query['statement.verb.id'];
        response.activities = query['statement.object.definition.type'];
        response.activityTypes = query['statement.object.id'];
        response.parents = query['statement.context.contextActivities.parent.id'];
        response.groups = query['statement.context.contextActivities.grouping.id'];
        response.platforms = query['statement.context.platform'];
        response.instructors = query['statement.context.instructor'];
        response.languages = query['statement.context.language'];
      }

      // Calls parent to initialise relations.
      return locker.Model.prototype._initializeRelations.bind(this)(response, empty);
    }
  });
});