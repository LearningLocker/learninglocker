import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { Card, CardText } from 'react-toolbox/lib/card';
import { oAuthLoginStart, loginStart, loginErrorSelector, loginRequestStateSelector } from 'ui/redux/modules/auth';
import Helmet from 'react-helmet';
import Link from 'ui/containers/Link';
import FullPageBackground from 'ui/components/FullPageBackground';
import { IN_PROGRESS } from 'ui/utils/constants';
import styles from './styles.css';

class Login extends Component {
  static propTypes = {
    oAuthLoginStart: PropTypes.func,
    loginStart: PropTypes.func,
    loginRequestState: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    loginError: PropTypes.string,
  }

  static contextTypes = {
    router: PropTypes.any
  }

  onClickLogin = (e) => {
    if (e) e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    if (email && password) this.props.loginStart({ username: email, password }).catch(() => {});
  }

  onClickOAuthLogin = (provider, e) => {
    if (e) e.preventDefault();
    this.props.oAuthLoginStart('google').catch(() => {});
  }

  render() {
    const error = this.props.loginError;
    const inProgress = (this.props.loginRequestState === IN_PROGRESS);

    const googleAuthEnabled = __GOOGLE_ENABLED__ || false;

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
                    ref={(ref) => { this.email = ref; }} />
                </div>
                <div className="form-group">
                  <label htmlFor="containersLoginPassword">Password</label>
                  <input
                    id="containersLoginPassword"
                    type="password"
                    className="form-control"
                    ref={(ref) => { this.password = ref; }} />
                </div>
                { error &&
                  <div className="alert alert-danger" role="alert">
                    <span className="sr-only">Error:</span> {error}
                  </div>
                }
              </CardText>
            </Card>
            { !inProgress &&
            <div className={styles.buttons}>
              <div className={styles.loginButtons}>
                <button type="submit" className="btn btn-primary" onClick={this.onClickLogin} >
                  <i className="ion-log-in" /> Login
                </button>
                {googleAuthEnabled &&
                  <button
                    onClick={this.onClickOAuthLogin.bind(null, 'google')}
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
  }
}

export default compose(
  withStyles(styles),
  connect(state => ({
    loginRequestState: loginRequestStateSelector(state),
    loginError: loginErrorSelector(state),
  }), { oAuthLoginStart, loginStart })
)(Login);
