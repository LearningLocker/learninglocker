import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import * as deleteUserOrganisationD from './deleteUserOrganisation';


/**
 * Action Creators
 */
export const deleteUserOrganisation = deleteUserOrganisationD.duck.actions.start;

/*
 * Reducers
 */
const reducers = combineReducers({
  DELETE: deleteUserOrganisationD.reducer,
});
const handler = handleActions(reducers);

const initialState = new Map();
export default function reducer(state = initialState, action = {}) {
  return handler(state, action);
}

/**
 * Sagas
 */
export const sagas = [
  ...deleteUserOrganisationD.duck.sagas,
];
