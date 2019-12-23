import React, { useState } from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
import {
  requestAppAccess,
  requestStateSelector
} from 'ui/redux/modules/requestAppAccess';
import { connect } from 'react-redux';
import { compose } from 'recompose';

const RequestAppAccessForm = (props) => {
  const [privacyPolicy, setPrivacyPolicy] = useState(true);
  const [formDisplay, setFormDisplay] = useState('initial');
  const [userMessage, setUserMessage] = useState();

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    props.requestAppAccess({
      appConfig: {
        privacyPolicy,
        appName: props.appName,
      }
    });
    setFormDisplay('none');
  };

  const handlePrivacyPolicyChange = (event) => {
    if (event === false) {
      setUserMessage('Please agree to the privacy policy');
    } else {
      setUserMessage('');
    }
    setPrivacyPolicy(event);
  };

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
          <form onSubmit={handleSubmit} style={{ display: formDisplay }}>
            <div className="form-group">
              <Checkbox label={privacyPolicyLabel} id="privacyPolicy" checked={privacyPolicy} onChange={handlePrivacyPolicyChange} />
            </div>
            <div className="form-group">
              <input disabled={!privacyPolicy} type="submit" className="btn btn-primary btn-sm" />
            </div>
          </form>
          <div>{userMessage}</div>
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
)(RequestAppAccessForm);
