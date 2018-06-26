import React from 'react';
import { Card, CardText } from 'react-toolbox/lib/card';
import { withModel } from 'ui/utils/hocs';
import {
  compose,
  withProps,
  withHandlers,
  withState
} from 'recompose';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import registerLogo from 'ui/static/register-logo.png';
import styles from './styles.css';

const Register = ({
  model,
  setRegistered,
  ok,
}) => {
  if (model.size === 0 || model.get('dontShowRegistration') === true || ok === true) {
    return <div />;
  }

  return (<Card>
    <CardText className={styles.container}>
      <div >
        <img className={styles.logo} role="presentation" src={registerLogo} />
        <div className={styles.registerText}>REGISTER YOUR LOCKER</div>
        <hr className={styles.divider} />
        <div className={styles.benefits}>Get helpdesk access and help promote the Open Source project</div>

        <div className={styles.buttons}>
          <a
            className={`btn btn-primary pull-right ${styles.register}`}
            href="https://www.ht2labs.com/learning-locker/register-installation/#register"
            target="_blank"
            onClick={setRegistered}
            rel="noopener noreferrer">Register</a>

          <span
            className={`pull-left ${styles.dontShowAgain}`}
            onClick={setRegistered}>Don&#39;t show again</span>

        </div>
      </div>
    </CardText>
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
  withState('ok', 'setOk', false),
  withStyles(styles)
)(Register);
