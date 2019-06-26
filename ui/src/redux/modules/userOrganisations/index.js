import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import * as createUserOrganisationD from './createUserOrganisation';
import * as deleteUserOrganisationD from './deleteUserOrganisation';


/**
 * Action Creators
 */
export const createUserOrganisation = createUserOrganisationD.duck.actions.start;
export const deleteUserOrganisation = deleteUserOrganisationD.duck.actions.start;

/*
 * Reducers
 */
const reducers = combineReducers({
  CREATE: createUserOrganisationD.reducer,
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
  ...createUserOrganisationD.duck.sagas,
  ...deleteUserOrganisationD.duck.sagas,
];
