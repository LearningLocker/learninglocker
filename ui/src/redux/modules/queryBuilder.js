import { createSelector } from 'reselect';
import { List, Set, Map, fromJS, Iterable } from 'immutable';
import { identity, memoize, isString } from 'lodash';
import { modelsByFilterSelector } from 'ui/redux/modules/models';
import {
  actorIdentToString,
  displayActivity,
  displayDefinition,
  displayActor,
  displayLangMap,
  displayVerb,
  getActorIdentifiers,
  identToString,
  objectIdentToString,
  strDisplay,
} from 'ui/utils/xapi';

/**
 * @param {*} searchString
 * @returns {immutable.Map}
 */
const searchStringToVerbFilter = searchString =>
  fromJS({ $or: [
    { 'value.id': { $regex: `${searchString}`, $options: 'i' } },
    { 'value.display.en-GB': { $regex: `${searchString}`, $options: 'i' } },
  ] });

// const searchStringToDefaultFilter = searchString =>
//   fromJS({ value: { $regex: `${searchString}`, $options: 'i' } });

/**
 * @param {*} searchString
 * @returns {immutable.Map}
 */
const searchStringToPersonaFilter = searchString =>
  fromJS({
    name: { $regex: `${searchString}`, $options: 'i' }
  });

/**
 * @param {string} mapPath
 * @param {immutable.Map} mapQuery
 * @param {immutable.Map} map
 * @returns {immutable.Map}
 */
export const reduceMap = (mapPath, mapQuery, map) => {
  // (path: string) => (
  //   accQuery: immutable.Map,
  //   value: immutable.Map|any,
  //   key: string
  // ) => immutable.Map
  const reducer = path => (accQuery, value, key) => {
    if (value instanceof Map) {
      return reduceMap(`${path}.${key}`, accQuery, value);
    }
    return accQuery.set(`${path}.${key}`, value);
  };

  return map.reduce(reducer(mapPath), mapQuery);
};

/**
 * @param {immutable.Map} actor
 * @returns {immutable.Map}
 */
export const getActorQuery = (actor) => {
  const result = reduceMap('statement.actor', new Map(), actor);
  return result
    .delete('statement.actor.name')
    .delete('statement.actor.objectType');
};

/**
 * @param {any} value
 * @returns {string}
 */
export const displayAuto = (value) => {
  if (Iterable.isIterable(value)) {
    if (value.has('objectType')) {
      // 'Activity', 'Agent', 'Group', 'SubStatement', 'StatementRef'
      switch (value.get('objectType')) {
        case 'Agent': return displayActor(value);
        case 'Group': return displayActor(value);
        case 'Activity': return displayActivity(value);
        default:
      }
    }
    // try to get the display property
    if (value.has('display')) {
      const display = value.get('display');
      if (Iterable.isIterable(display)) return displayLangMap(display);
      return display;
    }
    // try to get the definition property
    if (value.has('definition')) {
      const definition = value.get('definition');
      if (Iterable.isIterable(definition) && definition.size > 0) {
        return displayDefinition(definition);
      } else if (Iterable.isIterable(definition) && definition.size === 0) {
        return '';
      }
      return definition;
    }

    if (value.has('id') && !Iterable.isIterable(value.get('id'))) {
      return value.get('id');
    }

    return JSON.stringify(value.toJS());
  }

  return strDisplay(value);
};

/**
 * @param {*} date
 * @returns {immutable.Map}
 */
export const getDateQuery = date => fromJS({ $dte: date });

export const operators = {
  OR_DISCRETE: 'orDiscrete', // Query uses `$or` and `$nor` for multiple values
  DISCRETE: 'discrete',      // Query uses `$in` and `$nin` for multiple values
  CONTINUOUS: 'continuous',
  RANGE: 'range',
  BOOLEAN: 'boolean',
  STRING_MATCHES: 'stringMatches'
};

/**
 * @param {immutable.List} needle
 * @returns {(haystack: immutable.List) => boolean}
 */
const isChildKey = needle => (haystack) => {
  if (needle.size + 1 > haystack.size) return false;
  return needle.equals(haystack.take(needle.size));
};

const displayCacheValue = displayer => (cache) => {
  const display = cache.get('display', null);
  if (display === null) return displayer(cache.get('value'));
  if (isString(display)) return display;
  if (Map.isMap(display)) return displayLangMap(display);
  return displayer(cache.get('value'));
};

export const initialSections = fromJS({
  who: {
    title: 'Who',
    keyPath: new List(['person']),
    getQueryKey: 'person._id',
    sourceSchema: 'persona',
    searchStringToFilter: searchStringToPersonaFilter,
    getModelIdent: model => model.get('_id'),
    getModelDisplay: model => model.get('name', model.get('_id')),
    getModelQuery: model => new Map({ $oid: model.get('_id') }),
    getQueryModel: query => new Map({
      _id: new Map({ $oid: query.get('$oid') }),
    }),
    operators: operators.DISCRETE,
    children: {
      indentifiers: {
        title: 'Additional Data',
        childGenerators: new List([
          new Map({
            childOperators: operators.OR_DISCRETE,
            path: new List(['persona', 'import']),
            pathMatcher: path => (
              path.size > 1 &&
              path.get(0) === 'persona' &&
              (
                path.get(1).indexOf('statement') !== 0 ||
                path.get(1) === 'statement.actor.account.homePage'
              )
            ),
            getQuery: basePath => (value) => {
              const query = new Map({ key: basePath, value: value.get('value') });
              return new Map({
                'person._id': new Map({ $personaIdent: query })
              });
            },
            getModel: () => query => new Map({
              value: query
                .get('person._id', new Map())
                .get('$personaIdent', new Map())
                .get('value')
            }),
          }),
        ]),
      },
      actor: {
        title: 'Actor',
        keyPath: new List(['statement', 'actor']),
        getModelDisplay: displayCacheValue(displayActor),
        getModelIdent: model => actorIdentToString(model.get('value')),
        getModelQuery: model => getActorQuery(model.get('value')),
        getQueryModel: (query) => {
          if (query.has('statement.actor.mbox')) {
            return new Map({
              'value.mbox': query.get('statement.actor.mbox'),
              'value.objectType': 'Agent',
            });
          }
          if (query.has('statement.actor.mbox_sha1sum')) {
            return new Map({
              'value.mbox_sha1sum': query.get('statement.actor.mbox_sha1sum'),
              'value.objectType': 'Agent',
            });
          }
          if (query.has('statement.actor.openid')) {
            return new Map({
              'value.openid': query.get('statement.actor.openid'),
              'value.objectType': 'Agent',
            });
          }
          if (query.has('statement.actor.account.name')) {
            return new Map({
              'value.account.homePage': query.get('statement.actor.account.homePage'),
              'value.account.name': query.get('statement.actor.account.name'),
              'value.objectType': 'Agent',
            });
          }
          return new Map({ _id: null });
        },
        operators: operators.OR_DISCRETE,
      },
    },
  },
  verbs: {
    title: 'Did',
    keyPath: new List(['statement', 'verb']),
    getQueryKey: 'statement.verb.id',
    getModelIdent: model => identToString(model.get('value')),
    getModelDisplay: displayCacheValue(displayVerb),
    searchStringToFilter: searchStringToVerbFilter,
    getModelQuery: model => model.getIn(['value', 'id']),
    getQueryModel: query => new Map({ 'value.id': query }),
    operators: operators.DISCRETE,
  },
  objects: {
    title: 'What',
    keyPath: new List(['statement', 'object']),
    getQueryKey: 'statement.object.id',
    getModelIdent: model => objectIdentToString(model.get('value')),
    getModelDisplay: displayCacheValue(displayActivity),
    getModelQuery: model => model.getIn(['value', 'id']),
    getQueryModel: query => new Map({ 'value.id': query }),
    operators: operators.DISCRETE,
    children: {
      type: {
        title: 'Type',
        keyPath: new List(['statement', 'object', 'definition', 'type']),
        getQueryKey: 'statement.object.definition.type',
        getModelIdent: model => model.get('value'),
        getModelDisplay: displayCacheValue(identity),
        getModelQuery: model => model.get('value'),
        getQueryModel: query => new Map({ value: query }),
        operators: operators.DISCRETE,
      },
      extensions: {
        title: 'Extensions',
        childGenerators: new List([
          new Map({
            path: new List(['statement', 'object', 'definition', 'extensions'])
          })
        ]),
      },
    },
  },
  where: {
    title: 'Where',
    childGenerators: new List([
      new Map({
        path: new List(['statement', 'context'])
      })
    ]),
  },
  metadata: {
    title: 'Metadata',
    childGenerators: new List([
      new Map({
        path: new List(['metadata'])
      })
    ])
  },
  result: {
    title: 'Result',
    children: {
      scaled: {
        title: 'Scaled',
        keyPath: new List(['statement', 'result', 'score', 'scaled']),
        getQueryKey: 'statement.result.score.scaled',
        operators: operators.RANGE,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getModelDisplay: displayCacheValue(displayActivity),
        getValueQuery: value => value
      },
      response: {
        title: 'Response',
        keyPath: new List(['statement', 'result', 'response']),
        operators: operators.STRING_MATCHES,
        getValueQuery: value => value,
        getModelQuery: model => new Map({ 'statement.result.response': model }),
        getQueryModel: query => query.get('statement.result.response'),
      },
      complete: {
        title: 'Complete',
        keyPath: new List(['statement', 'result', 'completion']),
        operators: operators.BOOLEAN,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getValueQuery: value => value
      },
      success: {
        title: 'Success',
        keyPath: new List(['statement', 'result', 'success']),
        operators: operators.BOOLEAN,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getValueQuery: value => value
      },
      raw: {
        title: 'Raw result',
        keyPath: new List(['statement', 'result', 'score', 'raw']),
        getQueryKey: 'statement.result.score.raw',
        operators: operators.RANGE,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getModelDisplay: displayCacheValue(displayActivity),
        getValueQuery: value => value,
        step: 1,
        max: ''
      },
      max: {
        title: 'Max result',
        keyPath: new List(['statement', 'result', 'score', 'max']),
        getQueryKey: 'statement.result.score.max',
        operators: operators.RANGE,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getModelDisplay: displayCacheValue(displayActivity),
        getValueQuery: value => value,
        step: 1,
        max: ''
      },
      min: {
        title: 'Min result',
        keyPath: new List(['statement', 'result', 'score', 'min']),
        getQueryKey: 'statement.result.score.min',
        operators: operators.RANGE,
        getModelIdent: model => objectIdentToString(model.get('value')),
        getModelDisplay: displayCacheValue(displayActivity),
        getValueQuery: value => value
      }
    },
    childGenerators: new List([
      new Map({
        path: new List(['statement', 'result'])
      })
    ])
  },
  when: {
    title: 'When',
    children: {
      timestamp: {
        title: 'Timestamp',
        keyPath: new List(['timestamp']),
        operators: operators.CONTINUOUS,
        getValueQuery: getDateQuery,
        getEmptyQuery: () => getDateQuery(''),
        getQueryDisplay: query => query.get('$dte', '')
      },
      stored: {
        title: 'Stored',
        keyPath: new List(['stored']),
        operators: operators.CONTINUOUS,
        getValueQuery: getDateQuery,
        getEmptyQuery: () => getDateQuery(''),
        getQueryDisplay: query => query.get('$dte', '')
      }
    }
  },
  stores: {
    title: 'Store',
    keyPath: new List(['lrs_id']),
    getQueryKey: 'lrs_id',
    sourceSchema: 'lrs',
    getModelIdent: model => model.get('_id'),
    getModelDisplay: (model) => {
      const title = model.get('title', model.get('_id'));
      const count = model.get('statementCount', 0);
      return `${title} (${count} statements)`;
    },
    getModelQuery: model => new Map({ $oid: model.get('_id') }),
    getQueryModel: query => new Map({
      _id: new Map({ $oid: query.get('$oid') }),
    }),
    operators: operators.DISCRETE,
  },
});

/**
 * @param {Iterable|immutable.Map} object
 * @param {immutable.List} path
 * @returns {immutable.Map}
 */
const flattenDeep = (object, path = new List()) => {
  if (Iterable.isIterable(object)) {
    return object.map((child, key) =>
      flattenDeep(child, path.push(key))
    ).flatten();
  }
  return new Map({ [path.join('.')]: object });
};

/**
 * @param {immutable.Map} value
 * @returns {immutable.Map}
 */
export const getId = value => new Map({ id: value.get('id') });

/**
 * @param {immutable.Map} value
 * @returns {immutable.Map}
 */
export const getMongoId = value => new Map({ _id: { $oid: value.get('_id') } });

/**
 * @param {immutable.Iterable} value
 * @returns {immutable.Map}
 */
export const defaultParser = (value) => {
  if (Iterable.isIterable(value)) {
    if (value.has('objectType')) {
      // 'Activity', 'Agent', 'Group', 'SubStatement', 'StatementRef'
      switch (value.get('objectType')) {
        case 'Agent': return getActorIdentifiers(value);
        default:
      }
    }
    // try to get the id property
    if (value.has('id')) return getId(value);
    if (value.has('_id')) return getMongoId(value);
  }
  return value;
};

// turns querybuilder cache values such as actors into
// {
//  "statement.actor.account.name": "bradlycorkery",
//  "statement.actor.account.homePage": "www.example.com"
// }

export const matchArrays = (needle = new List(), hay = new List()) => {
  // if both arrays are empty
  if (needle.size === 0 && hay.size === 0) return true;
  let hasMatch = false;
  // while there are more elements in the hay
  hay.takeWhile((hayPath, index) => {
    const needlePath = needle.get(index);
    // if the element in hayPath is not set return false
    if (!hayPath || !needlePath) hasMatch = false;
    // if the element in hayPath is * return true, stop the loop
    else if (hayPath === '*') {
      hasMatch = true; return false;
    } else {
      // return true if it matches the same index in hayPath
      hasMatch = hayPath === needlePath;
    }
    return hasMatch;
  });
  return hasMatch;
};

/**
 * @param {string} valueType
 * @param {immutable.Map} generator
 * @param {immutable.List} childPath
 * @returns {{ operators: string, getValueQuery?: (value: any) => any }}
 */
const getChildOverridesFromValueType = (valueType, generator, childPath) => {
  if (valueType === 'Number') {
    return {
      operators: operators.RANGE,
      getValueQuery: value => value
    };
  }
  if (childPath.equals(new List(['statement', 'context', 'instructor']))) {
    return {
      operators: operators.OR_DISCRETE
    };
  }
  if (
    childPath.size === 4 &&
    childPath.take(3).equals(new List(['statement', 'context', 'contextActivities']))
  ) {
    return {
      operators: generator.get('childOperators', operators.DISCRETE),
      getModelQuery: value => value.getIn(['value', 'id'], value),
      getQueryModel: criteria => new Map({ value: { id: criteria } }),
      getQueryKey: childPath.push('id').join('.'),
      getModelIdent: model => identToString(model.getIn(['value', 'id'])),
    };
  }
  return {
    operators: generator.get('childOperators', operators.DISCRETE)
  };
};

/**
 * @param {string} basePath
 * @param {immutable.Iterable} value
 * @return {immutable.Map}
 */
export const valueToCriteria = (basePath, value) => {
  const idents = defaultParser(value);
  const flatIdents = flattenDeep(idents);
  const result = flatIdents.mapKeys(
    flatKey => ((flatKey === '') ? basePath : `${basePath}.${flatKey}`)
  ).map(v => fromJS(v));
  return result;
};

/**
 * @param {immutable.Map} generator
 * @returns {(keyPath: string[], valueType: ) => immutable.Map}
 */
const buildInputChild = generator => (keyPath, valueType) => {
  const joinedPath = keyPath.join('.');

  // (value: immutable.Map) => immutable.Map|string
  const getModelQuery = generator.has('getQuery')
    ? generator.get('getQuery')(joinedPath)
    : value => defaultParser(value.get('value'));

  // (criteria: immutable.Map|string) => immutable.Map
  const getQueryModel = generator.has('getModel')
    ? generator.get('getModel')(joinedPath)
    : criteria => new Map({ value: criteria });

  const childPath = generator.get('path').push(keyPath.last());
  const childGenerator = generator.set('path', childPath);
  const childOverrides = getChildOverridesFromValueType(valueType, generator, childPath);

  return new Map({
    keyPath,
    getQueryKey: joinedPath,
    getModelDisplay: generator.get('getChildDisplay', displayCacheValue(displayAuto)),
    getModelIdent: generator.get('getChildIdent', model => identToString(model.get('value'))),
    getModelQuery,
    getQueryModel,
    childGenerators: new List([childGenerator]),
    ...childOverrides,
  });
};

/**
 * @param {immutable.List<immutable.Map>} caches
 * @returns {(generator: immutable.Map) => immutable.Map}
 */
const getChildPaths = caches => (generator) => {
  const generatorPath = generator.get('path');
  const defaultPathMatcher = isChildKey(generatorPath);
  const pathMatcher = generator.get('pathMatcher', defaultPathMatcher);
  const depth = generatorPath.size + 1;
  const matchedCaches = caches.filter(cache => pathMatcher(cache.get('path')));
  return matchedCaches.groupBy(cache => cache.get('path').take(depth));
};

/**
 * @param {immutable.List<immutable.Map>} caches
 * @returns {(generator: immutable.Map) => immutable.Map}
 */
export const buildChildrenFromCaches = caches => (generator) => {
  const groupedCaches = getChildPaths(caches)(generator);
  return groupedCaches.map((groupedCache, keyPath) => {
    const paths = groupedCache.map(cache => cache.get('path'));
    const hasInput = paths.includes(keyPath);
    const hasChildren = paths.size > (hasInput ? 1 : 0);
    const childGenerator = new Map({ path: keyPath });
    const title = keyPath.skip(generator.get('path').size).join('.');
    const child = new Map({ title });
    const childWithInput = (hasInput ?
      buildInputChild(generator)(keyPath, groupedCache.first().get('valueType')) : new Map()
    );
    const childWithChildren = new Map({ children: (hasChildren ?
      buildChildrenFromCaches(caches)(childGenerator) : new Map()
    ) });
    return child.merge(childWithInput, childWithChildren);
  }).mapKeys(key => key.join('.'));
};

/**
 * @param {immutable.List<immutable.Map>} caches
 * @returns {(generators: immutable.List<immutable.Map>) => immutable.Map}
 */
const buildChildrenFromGenerators = caches => (generators) => {
  const results = generators.map(buildChildrenFromCaches(caches));
  return results.reduce(
    (res, result) => res.merge(result),
    new Map()
  );
};

/**
 * @param {immutable.Map} section
 * @returns {(caches: immutable.List<immutable.Map>) => (generators: immutable.List<immutable.Map>) => immutable.Map}
 */
const buildSectionFromGenerators = section => caches => (generators) => {
  const generatedChildren = buildChildrenFromGenerators(caches)(generators);
  return section.update('children', new Map(), children => children.merge(
    generatedChildren
  ));
};

const buildSectionFromCaches = memoize(
  (args = new Map()) => {
    const section = args.get('section');
    const caches = args.get('caches');

    // find children and update them
    let nextSection = section
      .update('children', new Map(),
        children => children.map(child =>
          buildSectionFromCaches(new Map({
            section: child,
            caches
          }))
        ));

    // does the section have a keyPath ?
    if (section.has('childGenerators')) {
      const generators = section.get('childGenerators', new List());
      nextSection = buildSectionFromGenerators(nextSection)(caches)(generators);
    }

    return nextSection;
  }
  , iterable => JSON.stringify(iterable.toJS())
);

// takes a built up query and gets the identifiers from it that match the given keyPath
// e.g. [statement, actor] will return a map of actor identifier objects
export const getIdentifiersFromMatch = (match, keyPath) => {
  const andSection = match.get('$and', new Set());
  const keyPathString = keyPath.join('.'); // ['statement', 'actor'] => 'statement.actor'
  const matchingSection = andSection.find(
    section => section.get('$comment') === keyPathString,
    null, new Map()
  );

  const identifiers = matchingSection.get('$or', new Set());

  return identifiers;
};

const updateQueryWithNewValues = (match, criteriaPath, values) => {
  const basePath = criteriaPath.join('.');
  const criteria = values.keySeq().toList();
  const nextMatch = match.update('$and', value => (List.isList(value) ? value : new List(value)));
  // find the index for this part of the match
  const rootAnd = nextMatch.get('$and');
  const foundIndex = rootAnd.findIndex(value => value.get('$comment') === basePath);
  // if criteria isn't empty add it to the match
  if (criteria.size > 0) {
    const matchKeyPath = (foundIndex >= 0)
      ? ['$and', foundIndex]
      : ['$and', rootAnd.size];
    return nextMatch.setIn(matchKeyPath, fromJS({
      $comment: JSON.stringify({ criteriaPath }),
      $or: criteria
    }));

  // otherwise remove it from the match
  } else if (foundIndex >= 0) {
    const matchKeyPath = ['$and', foundIndex];
    const deleteMatch = nextMatch.deleteIn(matchKeyPath);
    if (deleteMatch.get('$and').size === 0) return deleteMatch.delete('$and');
    return deleteMatch;
  }

  return match;
};

export const updateQueryAtKeyPath = (query = new Map(), keyPath, valuesUpdater) => {
  // cache the chosen values on the root of the query
  // query['statement','actor'] => [{actor}, {actor}]

  const values = getIdentifiersFromMatch(query, keyPath);
  const newValues = valuesUpdater(values);

  const newQuery = updateQueryWithNewValues(
    query,
    keyPath,
    newValues
  );
  return newQuery;
};

export const getAvailableSections = (sections, filter) => createSelector(
  [modelsByFilterSelector('querybuildercache', filter)],
  caches => sections
    .map(section =>
      buildSectionFromCaches(new Map({ section, caches }))
    )
);

export const getAvailableSection = (section, filter) => createSelector(
  [modelsByFilterSelector('querybuildercache', filter)],
  caches => buildSectionFromCaches(new Map({ section, caches }))
);
