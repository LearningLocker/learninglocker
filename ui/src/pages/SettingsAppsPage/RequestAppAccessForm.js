import React, { useState } from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
import { requestAppAccess } from 'ui/redux/modules/requestAppAccess';
import { connect } from 'react-redux';

const RequestAppAccessForm = (props) => {
  const [privacyPolicy, setPrivacyPolicy] = useState(true);
  const [userMessage, setUserMessage] = useState('');
  const [formDisplay, setFormDisplay] = useState('initial');

  const handleSubmit = (event) => {
    if (event) { event.preventDefault(); }
    setFormDisplay('none');
    props.requestAppAccessAction({ privacyPolicy, appName: props.appName });
    setUserMessage('Thank you, we\'ll be in touch');
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
        </div>
      </div>
    </div>);
};

export default connect(() => ({}), { requestAppAccessAction: requestAppAccess })(RequestAppAccessForm);
