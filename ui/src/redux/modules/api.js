import { call } from 'redux-saga/effects';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function*
  callApi({ onStart, onSuccess, onComplete, onFailure, sendRequest, sendRequestArgs }) {
  yield call(onStart);
  const { status, body, headers } = yield call(sendRequest, ...sendRequestArgs);

  try {
    if (status >= 400) throw new Error(body.error);
    yield call(onSuccess, body, headers);
    yield call(delay, 2000); // shows the success/failure state for 2 seconds
    yield call(onComplete);
  } catch (err) {
    // handle failed requests
    yield call(onFailure, err.message);
    yield call(delay, 2000); // shows the success/failure state for 2 seconds
    yield call(onComplete);
  }
}
