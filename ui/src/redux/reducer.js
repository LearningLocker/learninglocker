import { combineReducers } from 'redux';
import recycleState from 'redux-recycle';
import { router5Reducer } from 'redux-router5';

import auth, { LOGOUT, ORG_LOGOUT } from 'ui/redux/modules/auth';
import pagination from 'ui/redux/modules/pagination';
import models from 'ui/redux/modules/models';
import aggregation from 'ui/redux/modules/aggregation';
import statements from 'ui/redux/modules/statements';
import search from 'ui/redux/modules/search';
import uploadpeople from 'ui/redux/modules/people';
import exportsReducer from 'ui/redux/modules/exports';
import logo from 'ui/redux/modules/logo';
import clientIds from 'ui/redux/modules/clientIds';
import toasts from 'ui/redux/modules/toasts';
import queries from 'ui/redux/modules/queries';
import metadata from 'ui/redux/modules/metadata';
import app from 'ui/redux/modules/app';
import alerts from 'ui/redux/modules/alerts';

export default combineReducers({
  auth: recycleState(auth, [LOGOUT]),
  pagination: recycleState(pagination, [LOGOUT, ORG_LOGOUT]),
  aggregation: recycleState(aggregation, [LOGOUT, ORG_LOGOUT]),
  models: recycleState(models, [LOGOUT, ORG_LOGOUT]),
  uploadpeople: recycleState(uploadpeople, [LOGOUT, ORG_LOGOUT]),
  exports: recycleState(exportsReducer, [LOGOUT, ORG_LOGOUT]),
  logo: recycleState(logo, [LOGOUT, ORG_LOGOUT]),
  statements: recycleState(statements, [LOGOUT, ORG_LOGOUT]),
  search: recycleState(search, [LOGOUT, ORG_LOGOUT]),
  toasts: recycleState(toasts, [LOGOUT, ORG_LOGOUT]),
  clientIds: recycleState(clientIds, [LOGOUT, ORG_LOGOUT]),
  queries: recycleState(queries, [LOGOUT, ORG_LOGOUT]),
  metadata: recycleState(metadata, [LOGOUT, ORG_LOGOUT]),
  alerts: recycleState(alerts, [LOGOUT, ORG_LOGOUT]),
  app,
  router: router5Reducer
});
