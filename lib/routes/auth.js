import canViewModel from 'lib/services/auth/canViewModel';
import {
  isSiteAdminSelector,
  isAuthenticatedSelector,
  getExistingOrgLoginAction,
  getExistingLoginAction,
  orgLoginStart,
  setActiveTokenAction,
  currentScopesSelector,
} from 'ui/redux/modules/auth';

const requireLogin = (router, dependencies) => () => {
  const store = dependencies.store;
  store.dispatch(getExistingLoginAction());
  const isAuthenticated = isAuthenticatedSelector('user')(store.getState());
  if (isAuthenticated) {
    store.dispatch(setActiveTokenAction('user'));
    return true;
  }
  // Not logged in, so can't be here!
  return Promise.reject({ redirect: { name: 'login' } });
};

const requireSiteAdmin = (router, dependencies) => () => {
  const store = dependencies.store;
  store.dispatch(getExistingLoginAction());
  const isSiteAdmin = isSiteAdminSelector(store.getState());
  if (isSiteAdmin) {
    store.dispatch(setActiveTokenAction('user'));
    return true;
  }
  // Not logged in as admin, so can't be here!
  return Promise.reject({ redirect: { name: 'home' } });
};

const requireOrgLogin = (router, dependencies) => (toState) => {
  const store = dependencies.store;
  const organisationId = toState.params.organisationId;

  store.dispatch(getExistingLoginAction());
  store.dispatch(getExistingOrgLoginAction(organisationId));

  const state = store.getState();
  const hasOrgAuth = isAuthenticatedSelector('organisation', organisationId)(state);
  if (hasOrgAuth) {
    // use the current org token for making api requests
    store.dispatch(setActiveTokenAction('organisation', organisationId));
    return true;
  }

  // try to automatically log in
  return store.dispatch(orgLoginStart({ organisation: organisationId }))
    .then(() => { store.dispatch(setActiveTokenAction('organisation', organisationId)); })
    .catch(() => Promise.reject({ redirect: { name: 'home' } }));
};

const requireNoLogin = (router, dependencies) => () => {
  const store = dependencies.store;
  store.dispatch(getExistingLoginAction());
  const isAuthenticated = isAuthenticatedSelector('user')(store.getState());
  if (isAuthenticated) {
    // already logged in, you should go to the home page
    return Promise.reject({ redirect: { name: 'home' } });
  }
  // Not logged in, this is the place for you!
  return true;
};

const requireModelViewScope = modelName => (router, dependencies) => (toState) => {
  const store = dependencies.store;
  const state = store.getState();
  const activeScopes = currentScopesSelector(state);
  const hasViewScope = canViewModel(modelName, activeScopes.toJS());
  if (hasViewScope) return true;
  return Promise.reject({ redirect: { name: 'organisation.data.dashboards', params: toState.params } });
};

export {
  requireLogin,
  requireNoLogin,
  requireSiteAdmin,
  requireOrgLogin,
  requireModelViewScope,
};
