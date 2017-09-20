import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Card } from 'react-toolbox/lib/card';
import classNames from 'classnames';
import Helmet from 'react-helmet';
import { COMPLETED } from 'ui/utils/constants';
import {
  requestPasswordResetStart,
  requestResetErrorSelector,
  requestResetRequestStateSelector
} from 'ui/redux/modules/auth';
import FullPageBackground from 'ui/components/FullPageBackground';
import styles from './forgotpassword.css';

class ForgotPassword extends Component {
  static propTypes = {
    requestPasswordResetStart: PropTypes.func,
    requestResetError: PropTypes.string,
    requestResetState: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  }

  onSubmit = (e) => {
    if (e) e.preventDefault();
    const email = this.email.value;
    if (email) this.props.requestPasswordResetStart(email).catch(() => {});
  }

  renderForm() {
    const { requestResetError } = this.props;
    const formGroupClasses = classNames({
      'form-group': true,
      'has-error': requestResetError
    });

    return (
      <div>
        <form className="col-md-12" onSubmit={this.onSubmit}>
          <Card style={{ padding: '10px 20px' }}>
            <div className={formGroupClasses}>
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                className="form-control"
                ref={(ref) => { this.email = ref; }} />
              {requestResetError && (
                <div className="alert alert-danger" role="alert" style={{ marginTop: 10 }}>
                  <span className="sr-only">Error:</span> {requestResetError}
                </div>
              )}
            </div>
          </Card>
          <div className={styles.buttonGroup}>
            <button type="submit" className="btn btn-primary">Send reset instructions</button>
          </div>
        </form>
      </div>
    );
  }

  renderSuccess = () => (
    <Card style={{ padding: '10px 20px', textAlign: 'center' }}>
      Instructions to reset your password have been sent to your email.
    </Card>
  );

  render() {
    const { requestResetState } = this.props;

    let stateView;
    switch (requestResetState) {
      default:
        stateView = this.renderForm();
        break;
      case COMPLETED:
        stateView = this.renderSuccess();
        break;
    }

    return (
      <div>
        <Helmet title="- Forgotten Password" />
        <FullPageBackground>
          <h3 style={{ marginBottom: '50px' }}>Forgotten password</h3>
          { stateView }
        </FullPageBackground>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => ({
      requestResetError: requestResetErrorSelector(state),
      requestResetState: requestResetRequestStateSelector(state),
    }),
    { requestPasswordResetStart }
  )
)(ForgotPassword);
