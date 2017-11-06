import orgScopes from 'lib/constants/orgScopes';

import {
  chain,
  mapValues,
  first,
  includes,
  without,
} from 'lodash';


const getWriteDependencies = (scope, scopes) => {
  const arrayKey = scope.split('/');
  const lastKey = arrayKey.slice(-1);
  const rest = arrayKey.slice(0, -1);

  const depScope = rest.concat('view').join('/');
  if (
    first(lastKey) === 'edit' &&
    includes(scopes, depScope)
  ) {
    return [rest.concat('view').join('/')];
  }
  return [];
};

const getAllAllDependencies = (scope, scopes) => {
  if (scope === 'all') {
    return without(scopes, 'all');
  }
  return [];
};

// 'all' within context, not all all.
// ie org/all/dashboard/view should have
// dependency org/public/dashboard/view.
const getAllDependencies = (scope, scopes) => {
  const arrayKey = scope.split('/');
  const key = arrayKey.slice(1, 2);

  const depScope = `${arrayKey.slice(0, 1).join('/')}/public/${arrayKey.slice(2).join('/')}`;

  if (
    first(key) === 'all' &&
    includes(
      scopes,
      depScope
    )
  ) {
    return [depScope];
  }
  return [];
};

const getScopesDependencies = (scopes) => {
  const scopesObject = chain(scopes)
    .keyBy(scope => scope)
    .mapValues(() => [])
    .value();

  const out = mapValues(scopesObject, (_, scope) => [
    ...getWriteDependencies(scope, scopes),
    ...getAllDependencies(scope, scopes),
    ...getAllAllDependencies(scope, scopes),
  ]);

  return out;
};

export const getScopeDependencies = (scopes = orgScopes) => (scope) => {
  const dependencies = getScopesDependencies(scopes)[scope];

  if (dependencies.length === 0) {
    return [];
  }

  const subDependencies = chain(dependencies)
    .map(getScopeDependencies(scopes))
    .flatten()
    .union()
    .value();


  return [...dependencies, ...subDependencies];
};

export const getScopeDependents = (scopes = orgScopes) => (scope) => {
  const dependents = chain(getScopesDependencies(scopes))
    .pickBy(dependencieScopes =>
      includes(dependencieScopes, scope)
    )
    .keys();

  if (dependents.length === 0) {
    return [];
  }

  const dependentsDepentents = chain(dependents)
    .map(getScopeDependents(scopes))
    .flatten()
    .union()
    .value();

  return [...dependents, ...dependentsDepentents];
};
