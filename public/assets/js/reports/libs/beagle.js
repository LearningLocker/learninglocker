// github.com/ht2/beagle
(function() {
  var beagle;

  beagle = {
    walk: function(callback, params, scope) {
      if (params == null) {
        params = {};
      }
      scope = scope || window;
      return (scope.onhashchange = function() {
        return callback(params, scope.location.hash.slice(1));
      })();
    },
    routes: (function() {
      var addModifiedParam, clone, isWildcard, matchRoute, pathToArray;
      pathToArray = function(path) {
        return path.split('/');
      };
      clone = function(obj) {
        var Clone;
        Clone = function() {};
        Clone.prototype = obj;
        return function() {
          return new Clone();
        };
      };
      addModifiedParam = function(params, route, path, modifiers) {
        var key, modifier;
        key = route.slice(1);
        modifier = modifiers[key] || function(value) {
          return value;
        };
        return params[key] = modifier(path, params);
      };
      isWildcard = function(arr) {
        if (arr == null) {
          arr = [];
        }
        return arr[arr.length - 1] === '*';
      };
      matchRoute = function(route, pathArray, params, modifiers) {
        var match, routeParts;
        match = true;
        routeParts = pathToArray(route);
        routeParts.forEach(function(routePart, index) {
          var pathPart;
          pathPart = pathArray[index];
          if (routePart[0] === ':') {
            return addModifiedParam(params, routePart, pathPart, modifiers);
          } else if (!((routePart === '*') || (routePart === pathPart))) {
            return match = false;
          }
        });
        match = match && (routeParts.length === pathArray.length || isWildcard(routeParts));
        pathArray.splice(0, routeParts.length - !!isWildcard(routeParts));
        return match;
      };
      return function(routes, modifiers) {
        if (routes == null) {
          routes = {};
        }
        if (modifiers == null) {
          modifiers = {};
        }
        return function(params, path) {
          var callback, newParams, newPath, pathArray, route, _results;
          if (params == null) {
            params = {};
          }
          if (path == null) {
            path = '';
          }
          pathArray = pathToArray(path);
          params = clone(params);
          _results = [];
          for (route in routes) {
            callback = routes[route];
            newParams = params();
            newPath = pathArray.concat();
            if (matchRoute(route, newPath, newParams, modifiers)) {
              _results.push(callback(newParams, newPath.join('/')));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      };
    })()
  };

  if (typeof this.define === 'function') {
    this.define('beagle', [], beagle);
  } else {
    this.beagle = beagle;
  }

}).call(this);