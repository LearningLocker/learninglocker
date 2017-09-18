import { createSelector } from 'reselect';
import { call, put } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { download } from 'ui/utils/schemas';
import { normalize } from 'normalizr';
import { mergeEntities, entityReviver } from 'ui/redux/modules/models';
import { clearModelsCache } from 'ui/redux/modules/pagination';

export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';
export const FAILED = 'FAILED';

const exportsSelector = state => state.exports;

const exportRequestStateSelector = createSelector(
  [exportsSelector],
  exports => exports.get('requestState', false)
);

const shouldExportSelector = createSelector(
  [exportRequestStateSelector],
  requestState => (requestState !== IN_PROGRESS)
);

const downloadExport = createAsyncDuck({
  actionName: 'learninglocker/models/DOWNLOAD_EXPORT',

  reduceStart: state => state.set(['requestState'], IN_PROGRESS),
  reduceSuccess: state => state.set(['requestState'], COMPLETED),
  reduceFailure: state => state.set(['requestState'], FAILED),
  reduceComplete: state => state.set(['requestState'], null),

  startAction: ({ exportId, pipelines }) => ({ exportId, pipelines }),
  successAction: ({ exportId }) => ({ exportId }),
  failureAction: ({ exportId }) => ({ exportId }),
  completeAction: ({ exportId }) => ({ exportId }),
  checkShouldFire: (action, state) => shouldExportSelector(state),

  doAction: function* downloadExportSaga({ exportId, pipelines, llClient }) {
    const { body } = yield call(llClient.downloadExport, { exportId, pipelines });
    const result = normalize(body, download);
    const entities = entityReviver(result);
    const model = entities.get('download').first();
    yield put(mergeEntities(entities));
    yield put(clearModelsCache({ schema: 'download' }));
    // map the ids against the filter in the pagination store
    return yield { exportId, model };
  }
});

export const selectors = {
  shouldExportSelector
};

export const reducers = downloadExport.reducers;
export const actions = downloadExport.actions;
export const sagas = downloadExport.sagas;
