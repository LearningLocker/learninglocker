import { Iterable, List, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import * as scopes from 'lib/constants/scopes';
import { handleActions } from 'redux-actions';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import * as loginDuck from 'ui/redux/modules/auth/login';
import * as orgLoginDuck from 'ui/redux/modules/auth/orgLogin';
import * as tokenDuck from 'ui/redux/modules/auth/token';
import * as logoutDuck from 'ui/redux/modules/auth/logout';
import * as orgLogoutDuck from 'ui/redux/modules/auth/orgLogout';
import * as resetPasswordDuck from 'ui/redux/modules/auth/resetPassword';
import * as requestResetPasswordDuck from 'ui/redux/modules/auth/requestResetPassword';

export const LOGOUT = logoutDuck.LOGOUT;
export const ORG_LOGOUT = orgLogoutDuck.ORG_LOGOUT;

export const initialState = fromJS({
  activeTokenType: 'user', // which type of token is default for requests
  activeTokenId: null, // which token id to use for requests e.g. active organisation id
  loginRequestState: false,
  orgLoginRequestState: false,
  passwordResetState: false,
  passwordRequestResetState: false,
  tokens: {}
});

/*
 * Reducers
 */
const handler = handleActions({
  ...loginDuck.reducers,
  ...orgLoginDuck.reducers,
  ...tokenDuck.reducers,
  ...logoutDuck.reducers,
  ...orgLogoutDuck.reducers,
  ...resetPasswordDuck.reducers,
  ...requestResetPasswordDuck.reducers
});

export default function reducer(state = initialState, action = {}) {
  if (!Iterable.isIterable(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */
export const loginStart = loginDuck.actions.basic.start;
export const oAuthLoginStart = loginDuck.actions.oauth.start;
export const orgLoginStart = orgLoginDuck.actions.start;
export const decodeLoginTokenAction = tokenDuck.actions.decodeLoginTokenAction;
export const getExistingOrgLoginAction = tokenDuck.actions.getExistingOrgLoginAction;
export const getExistingLoginAction = tokenDuck.actions.getExistingLoginAction;
export const setActiveTokenAction = tokenDuck.actions.setActiveTokenAction;
export const logout = logoutDuck.actions.logoutAction;
export const orgLogout = orgLogoutDuck.actions.orgLogoutAction;
export const resetPasswordStart = resetPasswordDuck.actions.start;
export const requestPasswordResetStart = requestResetPasswordDuck.actions.start;


/*
 * Selectors
 */
export const authenticationSelector = state => state.auth;

export const isAuthenticatedSelector = (type = 'user', id) => createSelector(
  tokenDuck.selectors.authTokenSelector(type, id),
  token => !!token
);

export const loggedInUserId = createSelector(
  state => tokenDuck.selectors.authSelector(
    state.auth.get('activeTokenType', 'user'),
    state.auth.get('activeTokenId')
  )(state),
  authState => authState.get('userId')
);

export const loggedInUserSelector = createSelector(
  [state => state, loggedInUserId],
  (state, userId) => modelsSchemaIdSelector('user', userId)(state)
);


export const currentScopesSelector = createSelector(
  tokenDuck.selectors.activeAuthSelector,
  authState => authState.get('scopes', new List())
);

export const hasScopeSelector = scope => createSelector(
  currentScopesSelector,
  activeScopes => activeScopes.includes(scope)
);

export const organisationSettingsSelector = createSelector(
  loggedInUserSelector,
  user => user.get('organisationSettings')
);

export const activeOrganisationSettingsSelector = createSelector(
  loggedInUserSelector,
  activeOrgIdSelector,
  organisationSettingsSelector,
  (user, orgId, organisationSettings) => {
    if (!organisationSettings) return null;
    if (!orgId) return null;
    return organisationSettings.find(
      os => os.get('organisation', '').toString() === orgId.toString()
    );
  }
);

export const isSiteAdminSelector = createSelector(
  currentScopesSelector,
  currentScopes =>
    (currentScopes ? currentScopes.includes(scopes.SITE_ADMIN) : false)
);

export const requestResetErrorSelector = requestResetPasswordDuck.selectors.requestResetErrorSelector;
export const requestResetRequestStateSelector = requestResetPasswordDuck.selectors.requestResetRequestStateSelector;

export const resetErrorSelector = resetPasswordDuck.selectors.resetErrorSelector;
export const resetRequestStateSelector = resetPasswordDuck.selectors.resetRequestStateSelector;

export const loginErrorSelector = loginDuck.selectors.loginErrorSelector;
export const loginRequestStateSelector = loginDuck.selectors.loginRequestStateSelector;

export const activeAuthSelector = tokenDuck.selectors.activeAuthSelector;
export const activeTokenSelector = tokenDuck.selectors.activeTokenSelector;

/**
 * Sagas
 */
export const sagas = [
  ...loginDuck.sagas,
  ...orgLoginDuck.sagas,
  ...tokenDuck.sagas,
  ...logoutDuck.sagas,
  ...orgLogoutDuck.sagas,
  ...resetPasswordDuck.sagas,
  ...requestResetPasswordDuck.sagas
];
