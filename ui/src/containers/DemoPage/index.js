import React, { useState } from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
import { salesEmailEnquiry } from 'ui/redux/modules/salesEmailEnquiry';
import { connect } from 'react-redux';

const Demo = ({ salesEmailEnquiryAction }) => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState(true);
  const [mailingList, setMailingList] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const signUpToMailingList = (signUpEmail) => {
    // Hubspot signup
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    if (email !== '' && privacyPolicy) {
      salesEmailEnquiryAction({ fullName, company, email, mailingList, privacyPolicy });
      setUserMessage('Thank you, we\'ll be in touch');
    }
    if (mailingList) {
      signUpToMailingList(email);
    }
  };

  const handleFullNameChange = (event) => {
    setFullName(event.target.value);
  };

  const handleCompanyChange = (event) => {
    setCompany(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePrivacyPolicyChange = (event) => {
    event === false ? setUserMessage('Please agree to the privacy policy') : setUserMessage('');
    setPrivacyPolicy(event);
  };

  const handleMailingListChange = (event) => {
    setMailingList(event);
  };

  const privacyPolicyLabel = (
    <div>*I consent to storage of my data according to the <a href="https://www.ht2labs.com/privacy-policy/" target="blank">Privacy Policy</a></div>
  );

  return (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          Get in touch to find out how to access this app
        </div>
      </header>
      <div className="box">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="form-control"
              placeholder="Your first name"
              type="text"
              value={fullName}
              onChange={handleFullNameChange} />
          </div>
          <div className="form-group">
            <label htmlFor="companyInput">Company</label>
            <input
              id="company"
              className="form-control"
              placeholder="Your company"
              type="text"
              value={company}
              onChange={handleCompanyChange} />
          </div>
          <div className="form-group">
            <label htmlFor="emailInput">*Email</label>
            <input
              id="email"
              className="form-control"
              placeholder="Your email address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required />
          </div>
          <div className="form-group">
            <Checkbox
              label={privacyPolicyLabel}
              id="privacyPolicy"
              checked={privacyPolicy}
              onChange={handlePrivacyPolicyChange} />
          </div>
          <div className="form-group">
            <Checkbox
              id="mailingList"
              label="Please subscribe me to the 'Friends of HT2 Labs' Mailing List"
              checked={mailingList}
              onChange={handleMailingListChange} />
          </div>
          <div className="form-group">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}>
              Submit
          </button>
          </div>
          <div>{userMessage}</div>
        </form>
      </div>
    </div>
  );
};

export default connect(state => ({}), { salesEmailEnquiryAction: salesEmailEnquiry })(Demo);
