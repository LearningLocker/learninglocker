import { call, takeEvery } from 'redux-saga/effects';
import { addModel } from 'ui/redux/modules/models';

export const COPY_VISUALISATION = 'learninglocker/visualisation/COPY_VISUALISATION';

/**
 * @type {Set} - not immutable.Set
 */
const IGNORING_COLUMN_SET = new Set(['_id', 'updatedAt', 'createdAt', '__v', 'owner']);

/**
 * @param {immutable.Map} _.visualisation
 * @param {string} _.userId
 * @param {function} _.dispatch
 */
function* copyVisualisation({ visualisation, userId, dispatch }) {
  const newDescription = visualisation.has('description')
    ? `Copied from "${visualisation.get('description')}"`
    : undefined;

  const newVisualisation = visualisation
    .filter((_, k) => !IGNORING_COLUMN_SET.has(k))
    .set('description', newDescription)
    .set('owner', userId);

  yield call(dispatch, addModel({
    schema: 'visualisation',
    props: newVisualisation,
  }));
}

function* watchCopyVisualisationSaga() {
  if (__CLIENT__) yield takeEvery(COPY_VISUALISATION, copyVisualisation);
}

export const sagas = [watchCopyVisualisationSaga];
