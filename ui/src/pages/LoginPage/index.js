import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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

const enhance = compose(
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

/**
 * @param oAuthLoginStart - {@see reduxOAuthLoginStart}
 * @param loginStart - {@see reduxLoginStart}
 * @param loginRequestState - {@see loginRequestStateSelector}
 * @param loginError - {@see loginErrorSelector}
 * @param googleAuth - {@see getAppDataSelector}
 * @returns {*}
 */
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

  const onClickOAuthLogin = (event) => {
    if (event) {
      event.preventDefault();
    }

    oAuthLoginStart('google').catch(() => { });
  };

  const error = loginError;
  const inProgress = loginRequestState === IN_PROGRESS;
  const googleAuthEnabled = googleAuth.get('enabled', false);

  return (
    <FullPageBackground width={400}>
      <div>
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
            <div>
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button
                  style={{ margin: '0 5px' }}
                  type="submit"
                  className="btn btn-primary"
                  onClick={onClickLogin} >
                  <i className="ion-log-in" /> Login
                </button>
                {googleAuthEnabled &&
                  <button
                    style={{ margin: '0 5px' }}
                    onClick={onClickOAuthLogin}
                    className="btn btn-primary">
                    <i className="icon ion-social-googleplus" /> Google
                </button>
                }
              </div>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
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
