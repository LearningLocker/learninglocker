define([
  'locker',
  'backbone',
  'basicauth'
], function(locker, backbone) {
  return locker.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: null,
      name: null,
      description: null,
      lrs: window.lrsId
    },
    relations: {
      actors: backbone.Collection,
      verbs: backbone.Collection,
      activities: backbone.Collection,
      activityTypes: backbone.Collection,
      parents: backbone.Collection,
      groups: backbone.Collection,
      platforms: backbone.Collection,
      instructors: backbone.Collection,
      languages: backbone.Collection
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },
    _initializeRelations: function (response, empty) {
      // @todo: Map `response.query` to expected relations.
      return locker.Model.prototype._initializeRelations(response, empty);
    }
  });
});