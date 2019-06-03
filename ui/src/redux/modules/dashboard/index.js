import * as blankDashboard from './blankDashboard';
import * as gettingStarted from './gettingStarted';

/*
 * Sagas
 */
/* eslint-disable import/prefer-default-export */
export const sagas = [
  ...blankDashboard.sagas,
  ...gettingStarted.sagas,
];
