import { take, put, call } from 'redux-saga/effects';
import { alert } from 'ui/redux/modules/alerts';

const SALES_EMAIL_ENQUIRY = 'learninglocker/SALES_EMAIL_ENQUIRY';
const SALES_EMAIL_ENQUIRY_SUCCESS = 'learninglocker/SALES_EMAIL_ENQUIRY_SUCCESS';
const SALES_EMAIL_ENQUIRY_FAILURE = 'learninglocker/SALES_EMAIL_ENQUIRY_FAILURE';

export const salesEmailEnquiry = ({ fullName, company, email, mailingList, privacyPolicy }) =>
  ({
    type: SALES_EMAIL_ENQUIRY,
    fullName,
    company,
    email,
    mailingList,
    privacyPolicy
  });

export const salesEmailEnquirySuccess = () =>
  ({
    type: SALES_EMAIL_ENQUIRY_SUCCESS,
  });

export const salesEmailEnquiryFailure = () =>
  ({
    type: SALES_EMAIL_ENQUIRY_FAILURE,
  });

function* salesEmailEnquirySaga() {
  while (true) {
    const { fullName, company, email, mailingList, privacyPolicy, llClient } = yield take(SALES_EMAIL_ENQUIRY);
    const { body, status } = yield call(llClient.salesEmailEnquiry, {
      fullName,
      company,
      email,
      mailingList,
      privacyPolicy
    });

    if (status > 200) {
      yield put(salesEmailEnquiryFailure({ body }));
      yield put(alert({
        message: body
      }));
    } else {
      yield put(salesEmailEnquirySuccess({ body }));
    }
  }
}

export const sagas = [
  salesEmailEnquirySaga,
];
