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
import registerLogo from 'ui/static/register-logo.png'
import styles from './styles.css';

const Register = ({
  model,
  setRegistered,
  ok,
  setOk
}) => {
  if(model.size === 0 || model.get('dontShowRegistration') === true || ok === true) {
    return <div></div>;
  }

  return <Card>
    <CardText className={styles.container}>
      <div >
        <img className={styles.logo} src={registerLogo} />
        <div className={styles.registerText}>REGISTER YOUR LOCKER</div>
        <hr className={styles.divider} />
        <div className={styles.benefits}>Get helpdesk access and help promote the Open Source project</div>

        <div className={styles.buttons}>

          <button
            className={`btn btn-primary pull-right ${styles.ok}`}
            onClick={() => setOk(true)}
            >OK</button>

          <button
            className={`btn btn-primary pull-right ${styles.dontShowAgain}`}
            onClick={setRegistered}
            >Don't show again</button>

          <a 
            className={`btn btn-danger ${styles.register}`}
            href="https://www.ht2labs.com/learning-locker/register-installation/"
            target="_blank"
            onClick={setRegistered}
            >Register</a>

        </div>
      </div>
    </CardText>
  </Card>;
}

export default compose(
  withProps(() => ({
    schema: 'siteSettings',
    id: SITE_SETTINGS_ID
  })),
  withModel,
  withHandlers({
    setRegistered: ({updateModel}) => () => {
      return updateModel({
        path: ['dontShowRegistration'],
        value: true
      })
    }
  }),
  withState('ok', 'setOk', false),
  withStyles(styles)
)(Register);