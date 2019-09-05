import React, { useState } from 'react';
import Checkbox from 'ui/components/Material/Checkbox';
// import sendUpgradeCustomerForm from 'lib/helpers/email';

const Demo = () => {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState(true);
  const [mailingList, setMailingList] = useState(false);
  const [submitDisabled, setDisabled] = useState(false);

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    console.log('Full name: ', fullName,
                ' Company: ', company,
                ' Email: ', email,
                ' Privacy Policy: ', privacyPolicy,
                ' Mailing List: ', mailingList
    );
    // sendUpgradeCustomerForm({ fullName, company, email, privacyPolicy, mailingList });
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
    setPrivacyPolicy(event);
    event = setDisabled(!event);
  };

  const handleMailingListChange = (event) => {
    setMailingList(event);
  };

  const label = (
    <div>I consent to storage of my data according to the <a href="https://www.ht2labs.com/privacy-policy/" target="blank">Privacy Policy</a> *required</div>
    );

  return (
    <div>
      <header id="topbar">
        <div className="heading heading-light">
          Get in touch to find out how to access this app
        </div>
      </header>
      <div className="box">
        <form>
          {/* <form onSubmit={handleSubmit}> */}
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              className="form-control"
              placeholder="Your first name"
              type="text"
              value={fullName}
              onChange={handleFullNameChange}
              required />
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
            <label htmlFor="emailInput">Email</label>
            <input
              id="email"
              className="form-control"
              placeholder="Your email address"
              type="text"
              value={email}
              onChange={handleEmailChange}
              required />
          </div>
          <div className="form-group">
            <Checkbox
              label={label}
              id="privacyPolicy"
              required
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
              onClick={handleSubmit}
              disabled={submitDisabled}>
              Submit
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Demo;
