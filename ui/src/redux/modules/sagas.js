import { map } from 'lodash';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { sagas as authSagas } from './auth';
import { sagas as paginationSagas } from './pagination';
import { sagas as modelSagas } from './models';
import { sagas as aggregationSagas } from './aggregation';
import { sagas as visualiseSagas } from './visualise';
import { sagas as uploadPeopleSagas } from './people';
import { sagas as exportSagas } from './exports';
import { sagas as uploadLogoSaga } from './logo';
import { sagas as toastSagas } from './toasts';
import { sagas as appSagas } from './app';
import { sagas as alertsSagas } from './alerts';

export const sagaMiddleware = createSagaMiddleware();

const runSaga = saga => fork(saga);

export default function* rootSaga() {
  yield [
    ...map(authSagas, runSaga),
    ...map(paginationSagas, runSaga),
    ...map(aggregationSagas, runSaga),
    ...map(visualiseSagas, runSaga),
    ...map(uploadPeopleSagas, runSaga),
    ...map(exportSagas, runSaga),
    ...map(uploadLogoSaga, runSaga),
    ...map(modelSagas, runSaga),
    ...map(toastSagas, runSaga),
    ...map(appSagas, runSaga),
    ...map(alertsSagas, runSaga),
  ];
}
