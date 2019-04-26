import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withContext, lifecycle } from 'recompose';
import { Card, CardText } from 'react-toolbox/lib/card';
import {
  oAuthLoginStart as reduxOAuthLoginStart,
  loginStart as reduxLoginStart,
  loginErrorSelector,
  loginRequestStateSelector
} from 'ui/redux/modules/auth';
import { getAppDataSelector, fetchAppData } from 'ui/redux/modules/app';
import Helmet from 'react-helmet';
import Link from 'ui/containers/Link';
import FullPageBackground from 'ui/components/FullPageBackground';
import { IN_PROGRESS } from 'ui/utils/constants';
import styles from './styles.css';

const enhance = compose(
  withStyles(styles),
  withContext({
    router: PropTypes.any,
  }, () => ({})),
  connect(state => ({
    loginRequestState: loginRequestStateSelector(state),
    loginError: loginErrorSelector(state),
    googleAuth: getAppDataSelector('googleAuth', false)(state),
  }), {
    oAuthLoginStart: reduxOAuthLoginStart,
    loginStart: reduxLoginStart,
    fetchAppData
  }),
  lifecycle({
    componentDidMount() {
      this.props.fetchAppData({ key: 'googleAuth' });
    },
  })
);

const render = ({
  oAuthLoginStart,
  loginStart,
  loginRequestState,
  loginError,
  googleAuth,
}) => {
  let emailInput;
  let passwordInput;

  const onClickLogin = (e) => {
    if (e) e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email && password) loginStart({ username: email, password }).catch(() => { });
  };

  const onClickOAuthLogin = (e) => {
    if (e) e.preventDefault();
    oAuthLoginStart('google').catch(() => { });
  };

  const error = loginError;
  const inProgress = loginRequestState === IN_PROGRESS;
  const googleAuthEnabled = googleAuth.get('enabled', false);

  return (
    <FullPageBackground width={400}>
      <div className={styles.loginWrapper}>
        <Helmet title="- Login" />
        <h3>Welcome</h3>
        <form>
          <Card>
            <CardText>
              <div className="form-group">
                <label htmlFor="containersLoginEmail">E-Mail</label>
                <input
                  id="containersLoginEmail"
                  className="form-control"
                  ref={(ref) => { emailInput = ref; }} />
              </div>
              <div className="form-group">
                <label htmlFor="containersLoginPassword">Password</label>
                <input
                  id="containersLoginPassword"
                  type="password"
                  className="form-control"
                  ref={(ref) => { passwordInput = ref; }} />
              </div>
              {error &&
                <div className="alert alert-danger" role="alert">
                  <span className="sr-only">Error:</span> {error}
                </div>
              }
            </CardText>
          </Card>
          {!inProgress &&
            <div className={styles.buttons}>
              <div className={styles.loginButtons}>
                <button type="submit" className="btn btn-primary" onClick={onClickLogin} >
                  <i className="ion-log-in" /> Login
              </button>
                {googleAuthEnabled &&
                  <button
                    onClick={onClickOAuthLogin}
                    className={`btn btn-primary ${styles.last}`} >
                    <i className="icon ion-social-googleplus" /> Google
                </button>
                }
              </div>
              <div className={styles.otherButtons}>
                <Link className="btn btn-primary" routeName={'forgot'}>
                  <i className="ion-key" /> Reset password
              </Link>
              </div>
            </div>
          }
        </form>
      </div>
    </FullPageBackground>
  );
};

export default enhance(render);
