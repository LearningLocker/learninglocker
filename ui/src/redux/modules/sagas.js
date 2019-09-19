import { map } from 'lodash';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { sagas as authSagas } from './auth';
import { sagas as dashboardSagas } from './dashboard';
import { sagas as paginationSagas } from './pagination';
import { sagas as modelSagas } from './models';
import { sagas as aggregationSagas } from './aggregation';
import { sagas as visualiseSagas } from './visualise';
import { sagas as uploadPeopleSagas } from './people';
import { sagas as exportSagas } from './exports';
import { sagas as uploadLogoSaga } from './logo';
import { sagas as toastSagas } from './toasts';
import { sagas as appSagas } from './app';
import { sagas as personasSagas } from './persona';
import { sagas as alertsSagas } from './alerts';
import { sagas as requestAppAccess } from './requestAppAccess';
import { sagas as visualisationSagas } from './visualisation';
import { sagas as userOrganisationsSagas } from './userOrganisations';
import { sagas as userOrganisationSettingsSagas } from './userOrganisationSettings';

export const sagaMiddleware = createSagaMiddleware();

const runSaga = saga => fork(saga);

export default function* rootSaga() {
  yield [
    ...map(authSagas, runSaga),
    ...map(dashboardSagas, runSaga),
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
    ...map(personasSagas, runSaga),
    ...map(requestAppAccess, runSaga),
    ...map(visualisationSagas, runSaga),
    ...map(userOrganisationsSagas, runSaga),
    ...map(userOrganisationSettingsSagas, runSaga),
  ];
}
