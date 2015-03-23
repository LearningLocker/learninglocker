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
      'object.id': 'activities',
      'object.definition.type': 'activityTypes',
      'context.contextActivities.parent.id': 'parents',
      'context.contextActivities.grouping.id': 'groups',
      'context.platform': 'platforms',
      'context.instructor': 'instructors',
      'context.language': 'languages'
    },
    _mapQueryToResponse: function (query, response) {
      Object.keys(this._queryResponseMap).forEach(function (queryKey) {
        var responseKey = this._queryResponseMap[queryKey];
        if (responseKey == 'actors') {
            var actorValues = ['actor.mbox', 'actor.account.name', 'actor.openId', 'actor.mbox_sha1sum'];
            var consolidatedActors = [];
            for (var i = 0; i < actorValues.length; i++) {
                queryKey = 'statement.' + actorValues[i];
                if (typeof query[queryKey] !== "undefined") {
                    var tempArray = [];
                    var label = '';
                    switch (actorValues[i]) {
                        case 'actor.mbox':          label = ''; break;
                        case 'actor.account.name':  label = 'account:'; break;
                        case 'actor.openId':        label = 'openId:'; break;
                        case 'actor.mbox_sha1sum':  label = 'mbox_sha1sum:'; break;
                    }
                    for(var j = 0; j < query[queryKey].length; j++) {
                        tempArray.push(label+query[queryKey][j]);
                    }
                    consolidatedActors = consolidatedActors.concat(tempArray);
                }
            }
            response[responseKey] = consolidatedActors;
        } else {
            queryKey = 'statement.' + queryKey;
            response[responseKey] = query[queryKey];
        }
      }.bind(this));
    },
    _mapResponseToQuery: function () {
      var query = this.get('query');
      Object.keys(this._queryResponseMap).forEach(function (queryKey) {
        var responseKey = this._queryResponseMap[queryKey];
        if (responseKey == 'actors') {
            //consolidate actor query values by type of IFI
            var combined = {'account':[], 'openId':[], 'mbox_sha1sum':[], 'mailto':[]};
            this.get(responseKey).map(function (model) {
                var value = model.get('value');
                var intermediateValue = '';
                
                if (value.indexOf('(') === -1) {
                    intermediateValue = value;
                } else {
                    intermediateValue =  value.split('(').pop().slice(0, -1);
                }
                
                var whichId = intermediateValue.split(':').shift();
                
                switch (whichId) {
                    case 'account':         combined.account.push(intermediateValue.slice(8,intermediateValue.length)); break;
                    case 'openId':          combined.account.push(intermediateValue.slice(7,intermediateValue.length)); break;
                    case 'mbox_sha1sum':    combined.account.push(intermediateValue.slice(13,intermediateValue.length)); break;
                    case 'mailto':          combined.mailto.push(intermediateValue); break
                }
            });

            //put the consolidated actor IFIs into query, to be combined in backend model
            for (var prop in combined) {
                if (combined[prop].length > 0) {
                    //if it has something to put in
                    switch (prop) {
                        case 'account':         query['statement.actor.account.name'] = combined[prop]; break;
                        case 'mailto':          query['statement.actor.mbox'] = combined[prop]; break;
                        case 'openId':          query['statement.actor.openId'] = combined[prop]; break;
                        case 'mbox_sha1sum':    query['statement.actor.mbox_sha1sum'] = combined[prop]; break;
                    }
                } else {
                    //since nothing to add, make undefined
                    switch (prop) {
                        case 'account':         query['statement.actor.account.name'] = undefined; break;
                        case 'mailto':          query['statement.actor.mbox'] = undefined; break;
                        case 'openId':          query['statement.actor.openId'] = undefined; break;
                        case 'mbox_sha1sum':    query['statement.actor.mbox_sha1sum'] = undefined; break;
                    }
                }
            }
        } else {
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
        }

      }.bind(this));
      this.set({query: query});
    },
    _initializeRelations: function (response, empty) {
      // Maps query relations to response.
      if (!empty && response.query != false && response.query != null) {
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
