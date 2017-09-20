import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { resetPasswordStart, resetRequestStateSelector, resetErrorSelector } from 'ui/redux/modules/auth';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { Card } from 'react-toolbox/lib/card';
import Helmet from 'react-helmet';
import { get } from 'lodash';
import { routeNodeSelector } from 'redux-router5';
import classNames from 'classnames';
import FullPageBackground from 'ui/components/FullPageBackground';
import Link from 'ui/containers/Link';
import uuid from 'uuid';
import styles from './styles.css';

class ResetPassword extends Component {
  static propTypes = {
    email: PropTypes.string,
    token: PropTypes.string,
    resetPasswordStart: PropTypes.func,
    resetRequestState: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    resetError: PropTypes.string,
  }

  onSubmit = (e) => {
    if (e) e.preventDefault();
    this.props.resetPasswordStart({
      email: this.props.email,
      token: this.props.token,
      password: this.password.value
    }).catch(() => {});
  }

  renderForm() {
    const { resetError } = this.props;
    const formGroupClasses = classNames({
      'form-group': true,
      'has-error': resetError
    });
    const passwordId = uuid.v4();

    return (
      <div>
        <form className="col-md-12" onSubmit={this.onSubmit}>
          <Card style={{ padding: '10px 20px' }}>
            <div className={formGroupClasses}>
              <label htmlFor={passwordId}>Password</label>
              <input
                id={passwordId}
                className="form-control"
                type="password"
                ref={(ref) => { this.password = ref; }} />
              {resetError && (
                <div className="alert alert-danger" role="alert" style={{ marginTop: 10 }}>
                  <span className="sr-only">Error:</span> {this.props.resetError}
                </div>
              )}
            </div>
          </Card>
          <div className={styles.buttonGroup}>
            <button type="submit" className="btn btn-primary">Reset password</button>
          </div>
        </form>
      </div>
    );
  }

  renderPending = () => (
    <Card style={{ padding: '10px 20px' }}>
      <p>Submitting password reset...</p>
    </Card>
  );

  renderSuccess = () => (
    <Card style={{ padding: '10px 20px', textAlign: 'center' }}>
      <p>You have succesfully reset your password.</p>
      <p><Link routeName="login">Click here to login.</Link></p>
    </Card>
  );


  render() {
    const requestStatus = this.props.resetRequestState;
    let stateView;

    switch (requestStatus) {
      default:
      case FAILED:
        stateView = this.renderForm();
        break;
      case IN_PROGRESS:
        stateView = this.renderPending();
        break;
      case COMPLETED:
        stateView = this.renderSuccess();
        break;
    }

    return (
      <FullPageBackground width={400}>
        <Helmet title="- Reset Password" />
        <h3 style={{ marginBottom: '50px' }}>Reset your password</h3>
        { stateView }
      </FullPageBackground>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => ({
      email: get(routeNodeSelector('reset')(state), ['route', 'params', 'email']),
      token: get(routeNodeSelector('reset')(state), ['route', 'params', 'token']),
      resetRequestState: resetRequestStateSelector(state),
      resetError: resetErrorSelector(state)
    }),
    { resetPasswordStart }
  )
)(ResetPassword);
