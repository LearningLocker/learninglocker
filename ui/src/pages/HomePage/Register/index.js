import React from 'react';
import { Card } from 'react-toolbox/lib/card';
import { withModel } from 'ui/utils/hocs';
import {
  compose,
  withProps,
  withHandlers,
  withState
} from 'recompose';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import registerLogo from 'ui/static/register-logo.png';
import { CardContainer } from './CardContainer';
import { Divider } from './Divider';
import { DontShowAgainText } from './DontShowAgainText';
import { RegistrationLink } from './RegistrationLink';
import { RegistrationLogo } from './RegistrationLogo';
import { RegistrationText } from './RegistrationText';

const Register = ({
  model,
  setRegistered,
  ok,
}) => {
  if (model.size === 0 || model.get('dontShowRegistration') === true || ok === true) {
    return <div />;
  }

  return (<Card>
    <CardContainer>
      <div>
        <RegistrationLogo role="presentation" src={registerLogo} />
        <RegistrationText>REGISTER YOUR LOCKER</RegistrationText>
        <Divider />
        <div style={{ fontSize: 16 }}>
          Get helpdesk access and help promote the Open Source project
        </div>

        <div style={{ marginTop: 20 }}>
          <RegistrationLink
            className="btn btn-primary pull-right"
            href="https://www.ht2labs.com/learning-locker/register-installation/#register"
            target="_blank"
            onClick={setRegistered}
            rel="noopener noreferrer">
            Register
          </RegistrationLink>

          <DontShowAgainText
            className="pull-left"
            onClick={setRegistered}>
            Don&#39;t show again
          </DontShowAgainText>

        </div>
      </div>
    </CardContainer>
  </Card>);
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
  withState('ok', 'setOk', false)
)(Register);
