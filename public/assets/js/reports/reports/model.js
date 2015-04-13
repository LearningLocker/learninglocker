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
        if (responseKey === 'actors') {
            var actorValues = ['actor.mbox', 'actor.account', 'actor.openid', 'actor.mbox_sha1sum'];
            var consolidatedActors = [];
            actorValues.forEach(function(value,index, originalArray) {
                queryKey = 'statement.' + value;
                if (typeof query[queryKey] !== "undefined") {
                    var tempArray = [];
                    var queryLabel = '';
                    switch (value) {
                        case 'actor.mbox':          queryLabel = ''; break;
                        case 'actor.account':       queryLabel = 'account:'; break;
                        case 'actor.openid':        queryLabel = 'openid:'; break;
                        case 'actor.mbox_sha1sum':  queryLabel = 'mbox_sha1sum:'; break;
                    }
                    query[queryKey].forEach(function(val, ind, orgArr) {
                        if (queryKey === 'statement.actor.account') {
                            tempArray.push(queryLabel + val.homePage + ' / ' + val.name);
                        } else {
                            tempArray.push(queryLabel + query[queryKey][ind]);
                        }
                    });
                    consolidatedActors = consolidatedActors.concat(tempArray);
                }
            });
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
            var combined = {'account':[], 'openid':[], 'mbox_sha1sum':[], 'mailto':[]};
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
                    case 'account':
                        //now for account, we need to split it into json object.
                        intermediateValue = intermediateValue.slice(8,intermediateValue.length).split(" / ");
                        var homePage = intermediateValue.shift();
                        var name = intermediateValue.pop();
                        var obj = {homePage:homePage, name:name};
                        combined.account.push(
                            obj
                        );
                        break;
                    case 'openid':
                        combined.openid.push(
                            intermediateValue.slice(7,intermediateValue.length)
                        );
                        break;
                    case 'mbox_sha1sum':
                        combined.mbox_sha1sum.push(
                            intermediateValue.slice(13,intermediateValue.length)
                        );
                        break;
                    case 'mailto':
                        combined.mailto.push(intermediateValue); 
                        break
                }
            });

            //put the consolidated actor IFIs into query, to be combined in backend model
            Object.keys(combined).forEach(function(value, index, originalArray) {
                if (combined[value].length > 0) {
                    switch (value) {
                        case 'account':         query['statement.actor.account'] = combined[value]; break;
                        case 'mailto':          query['statement.actor.mbox'] = combined[value]; break;
                        case 'openid':          query['statement.actor.openid'] = combined[value]; break;
                        case 'mbox_sha1sum':    query['statement.actor.mbox_sha1sum'] = combined[value]; break;
                    }
                } else {
                    switch (value) {
                        case 'account':         query['statement.actor.account'] = undefined; break;
                        case 'mailto':          query['statement.actor.mbox'] = undefined; break;
                        case 'openid':          query['statement.actor.openid'] = undefined; break;
                        case 'mbox_sha1sum':    query['statement.actor.mbox_sha1sum'] = undefined; break;
                    }
                }
            });
        } else {
            var newValue = (this.get(responseKey) || []).map(function (model) {
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
      this.set('query', query);
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
    save: function (attrs, opts) {
      opts || (opts = {});
      this._mapResponseToQuery();

      attrs = _.clone(this.attributes);
      opts.data = JSON.stringify(attrs);

      return Backbone.Model.prototype.save.call(this, attrs, opts);
    }
  });
});
