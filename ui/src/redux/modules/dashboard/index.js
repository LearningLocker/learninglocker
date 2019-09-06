import * as blankDashboard from './blankDashboard';
import * as copyDashboard from './copyDashboard';
import * as gettingStarted from './gettingStarted';

/*
 * Sagas
 */
/* eslint-disable import/prefer-default-export */
export const sagas = [
  ...blankDashboard.sagas,
  ...copyDashboard.sagas,
  ...gettingStarted.sagas,
];
