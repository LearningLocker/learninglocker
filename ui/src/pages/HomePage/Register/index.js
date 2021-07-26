import React, { useState, useRef } from 'react';
import { fromJS } from 'immutable';
import uuid from 'uuid';
import Portal from 'react-portal';
import classNames from 'classnames';
import { Card } from 'react-toolbox/lib/card';
import { withModel } from 'ui/utils/hocs';
import {
  compose,
  withProps,
  withHandlers
} from 'recompose';
import { SITE_SETTINGS_ID, SITE_SETTINGS_OS_REG_CODE } from 'lib/constants/siteSettings';
import ValidationList from 'ui/components/ValidationList';
import { CardContainer } from './CardContainer';
import { Divider } from './Divider';
import { NotNowText } from './NotNowText';
import { RegistrationLink, RegistrationLinkAccented } from './RegistrationLink';
import { RegistrationText, RegistrationInfoText } from './RegistrationText';

const Register = ({ setRegistered }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const codeRef = useRef();

  const onSubmit = (event) => {
    event.preventDefault();

    if (SITE_SETTINGS_OS_REG_CODE === codeRef.current.value) {
      setModalOpen(false);
      setRegistered();
    } else {
      setError('Incorrect code, please try again.');
    }
  };

  const renderInviteModal = () => {
    const codeId = uuid.v4();

    return (
      <Portal isOpened={modalOpen}>
        <span>
          <div className="modal animated fast fadeIn">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header modal-header-bg">
                  <button type="button" className="close" aria-label="Close" onClick={() => setModalOpen(false)}><span aria-hidden="true">&times;</span></button>
                  <h4 className="modal-title">Enter Code</h4>
                </div>
                <form onSubmit={onSubmit}>
                  <div className="modal-body clearfix">
                    <div
                      className={classNames({
                        'form-group': true,
                        'has-error': error
                      })} >
                      <label htmlFor={codeId}>Registration Code</label>
                      <input
                        autoFocus
                        id={codeId}
                        className="form-control"
                        type="text"
                        ref={codeRef} />
                      {error &&
                        (<span className="help-block">
                          <ValidationList errors={fromJS([error])} />
                        </span>
                        )
                      }
                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="col-xs-12 clearfix">
                      <button className="btn btn-primary btn-sm pull-right">
                        Confirm
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
          </div>
        </span>
      </Portal>
    );
  };

  const setProceedOnce = () => {
    sessionStorage.setItem('proceedOnce', true);
    document.dispatchEvent(new Event('setProceedOnce'));
  };

  return (<div>
    { renderInviteModal() }
    <div className="col-md-7" style={{ marginTop: 10 }}>
      <Card>
        <CardContainer>
          <div>
            <RegistrationText>Learning Locker Data Cloud</RegistrationText>
            <Divider />
            <RegistrationInfoText>
              <p>Feeling the strain of hosting your own?</p>
              <br />
              <p>Learning Locker Data Cloud is our fully managed option for Learning Locker, including a range of feature enhancing plugins only available to paying customers.</p>
              <ul>
                <li><p>Fully managed, auto-scaling, single tenant hosting in a range of AWS data locations</p></li>
                <li><p>World-class customer support, on the phone and online</p></li>
                <li><p>Secure to ISO 27001 certification standards</p></li>
                <li><p>Plug and play integrations with platforms such as Degreed, Cornerstone and Credly</p></li>
                <li><p>Data lake and BI integrations such as Tableau, SiSense and Power BI</p></li>
              </ul>
              <p>Unique plugin features including journeys, GDPR request management, semantic analysis, and statement forwarding.</p>
            </RegistrationInfoText>

            <RegistrationLinkAccented
              className="btn btn-primary pull-right"
              href="https://learningpool.com/solutions/learning-record-store-learning-locker"
              target="_blank"
              rel="noopener noreferrer">
              Get Learning Locker Data Cloud
            </RegistrationLinkAccented>

          </div>
        </CardContainer>
      </Card>
    </div>
    <div className="col-md-5" style={{ marginTop: 10 }}>
      <Card>
        <CardContainer>
          <div>
            <RegistrationText>Register</RegistrationText>
            <Divider />
            <RegistrationInfoText>
              <p>
                By registering, you help the Learning Locker team understand more about who is adopting xAPI, how Learning Locker is being used and gives us a feedback channel to reach out for input on our next features and releases.
              </p>
            </RegistrationInfoText>

            <RegistrationLink
              className="btn btn-primary pull-right"
              href="https://learningpool.com/register-locker"
              target="_blank"
              rel="noopener noreferrer">
              Register
            </RegistrationLink>

            <RegistrationLink
              className="btn btn-primary pull-right"
              onClick={() => setModalOpen(true)}
              rel="noopener noreferrer">
              Enter a Registration Code
            </RegistrationLink>

            <NotNowText
              className="pull-left"
              onClick={setProceedOnce}>
              Not now
            </NotNowText>

          </div>
        </CardContainer>
      </Card>
    </div>
  </div>);
};

export default compose(
  withProps(() => ({
    schema: 'siteSettings',
    id: SITE_SETTINGS_ID
  })),
  withModel,
  withHandlers({
    setRegistered: ({ updateModel }) => () => updateModel({
      path: ['dontShowRegistration'],
      value: true
    })
  }),
)(Register);
