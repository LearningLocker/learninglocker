import React from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
import {
  requestAppAccess,
  requestStateSelector
} from 'ui/redux/modules/requestAppAccess';
import { connect } from 'react-redux';
import {
  compose,
  withHandlers,
  withState,
} from 'recompose';

const formDisplayState = withState('formDisplay', 'setFormDisplay', 'initial');
const privacyPolicyState = withState('privacyPolicy', 'setPrivacyPolicy', true);
const userMessageState = withState('userMessage', 'setUserMessage');

const handlers = withHandlers({
  onSubmit: ({
    requestAppAccess: requestAppAccessAction,
    privacyPolicy,
    setFormDisplay,
    appName
  }) => (event) => {
    if (event) event.preventDefault();
    requestAppAccessAction({
      privacyPolicy,
      appName
    });
    setFormDisplay('none');
  },
  handlePrivacyPolicyChange: ({
    setPrivacyPolicy,
    setUserMessage,
  }) => (event) => {
    if (event === false) {
      setUserMessage('Please agree to the privacy policy');
    } else {
      setUserMessage('');
    }
    setPrivacyPolicy(event);
  }
});

const RequestAppAccessForm = (props) => {
  const privacyPolicyLabel = (<div>*I consent to storage of my data according to the <a href="https://www.ht2labs.com/privacy-policy/" target="blank">Privacy Policy</a></div>);

  return (
    <div>
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="panel-title">
            Get in touch to find out how to access this app
          </div>
        </div>
        <div className="box">
          <form onSubmit={props.onSubmit} style={{ display: props.formDisplay }}>
            <div className="form-group">
              <Checkbox label={privacyPolicyLabel} id="privacyPolicy" checked={props.privacyPolicy} onChange={props.handlePrivacyPolicyChange} />
            </div>
            <div className="form-group">
              <input disabled={!props.privacyPolicy} type="submit" className="btn btn-primary btn-sm" />
            </div>
          </form>
          <div>{props.userMessage}</div>
          {props.requestState === 'COMPLETED' && <span>Thank you, we will be in touch</span>}
          {props.requestState === 'FAILED' && <span>Access request failed, check email configuration</span>}
        </div>
      </div>
    </div>);
};

export default compose(
  connect(
    state => ({
      requestState: requestStateSelector()(state),
    }),
    { requestAppAccess }
    ),
  formDisplayState,
  privacyPolicyState,
  userMessageState,
  handlers,
)(RequestAppAccessForm);
