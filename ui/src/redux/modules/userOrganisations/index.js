import { combineReducers } from 'redux';
import { duck as deleteDuck, reducers as deleteReducers } from './deleteUserOrganisation';

/**
 * Action Creators
 */
export const deleteUserOrganisation = deleteDuck.actions.start;

/*
 * Reducers
 */
const reducers = combineReducers({
  delete: deleteReducers,
});
export default reducers;

/**
 * Sagas
 */
export const sagas = [
  ...deleteDuck.sagas,
];
