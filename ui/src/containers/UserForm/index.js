/* eslint-disable react/jsx-indent */
import React from 'react';
import { compose, withState, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { Map, List, fromJS } from 'immutable';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ValidationList from 'ui/components/ValidationList';
import Checkbox from 'ui/components/Material/Checkbox';
import uuid from 'uuid';
import { validatePasswordUtil } from 'lib/utils/validators/User';
import styles from './userform.css';

const changeModelAttr = (updateModel, model, attr) => value =>
  updateModel({ path: [attr], value });

const onChangeModelAttr = (updateModel, model) => attr => e =>
  changeModelAttr(updateModel, model, attr)(e.target.value);

const onPasswordCheckboxChange = (updateModel, model, setChangePasswordChecked) => (checkedAttr) => {
  if (!checkedAttr) {
    updateModel({ path: ['password'], value: '' });
    updateModel({ path: ['passwordConfirmation'], value: '' });
  }
  setChangePasswordChecked(checkedAttr);
};

const renderVerified = (model) => {
  const verifiedId = uuid.v4();
  return (
    <div className="form-group">
      <label htmlFor={verifiedId} className="control-label">Verified:</label>
      <span id={verifiedId}>
        {model.get('verified')
        ? <i className={`icon ion-checkmark ${styles.green}`} />
        : <i className={`icon ion-close ${styles.red}`} /> }
      </span>
    </div>
  );
};

const renderName = (model, onChangeAttr) => {
  const nameId = uuid.v4();
  return (
    <div className="form-group">
      <label htmlFor={nameId} className="control-label">Name</label>
      <input
        id={nameId}
        className="form-control"
        placeholder="Name"
        value={model.get('name')}
        onChange={onChangeAttr('name')} />
    </div>
  );
};

const renderEmail = (model, onChangeAttr) => {
  const emailId = uuid.v4();
  return (
    <div
      className={classNames({
        'form-group': true,
        'has-error': model.getIn(['errors', 'messages', 'email'], false)
      })} >
      <label htmlFor={emailId} className="control-label">Email</label>
      <input
        id={emailId}
        className="form-control"
        disabled={model.has('googleId')}
        placeholder="E-Mail"
        value={model.get('email')}
        onChange={onChangeAttr('email')} />
      { model.getIn(['errors', 'messages', 'email'], false) &&
        (<span className="help-block">
          <ValidationList errors={model.getIn(['errors', 'messages', 'email'])} />
        </span>)
      }
    </div>
  );
};

const renderPasswordChanges = (model, onCheck, changePasswordChecked) => {
  const passwordId = uuid.v4();
  return (
    <div className="form-group">
      <label htmlFor={passwordId}>Password</label>
      <div id={passwordId}>
        {model.get('verified') ? (
          <Checkbox
            key="change-password"
            checked={changePasswordChecked}
            label="Change password"
            onChange={onCheck} />
        ) : (
          <p className="help-block">Set a valid password in order to verify this user</p>
        )}
      </div>
    </div>
  );
};

const renderPassword = (password, setPassword, passwordGroupClasses, passwordErrors) => {
  const passwordId = uuid.v4();
  return (
    <div className={passwordGroupClasses}>
      <label htmlFor={passwordId} className="control-label">Password</label>
      <input
        id={passwordId}
        className="form-control"
        placeholder="Password"
        autoComplete="false"
        type="password"
        value={password}
        onChange={event => setPassword(event.target.value)} />
      {!passwordErrors.isEmpty() && (
        <span className="help-block">
          <ValidationList errors={passwordErrors} />
        </span>
      )}
    </div>
  );
};

const renderPasswordConfirmation = (passwordConfirmation, setPasswordConfirmation, passwordGroupClasses) => {
  const confirmationId = uuid.v4();
  return (
    <div className={passwordGroupClasses}>
      <label htmlFor={confirmationId} className="control-label">Confirm Password</label>
      <input
        id={confirmationId}
        className="form-control"
        placeholder="Confirm Password"
        autoComplete="false"
        type="password"
        value={passwordConfirmation}
        onChange={event => setPasswordConfirmation(event.target.value)} />
    </div>
  );
};

const validatePassword = (password, passwordConfirmation, ownerOrganisationSettings) => {
  if (password.length > 0) {
    const passwordValidation = validatePasswordUtil(password, ownerOrganisationSettings);
    const messages = passwordValidation.messages || [];

    if (password !== passwordConfirmation) {
      messages.push('Password confirmation does not match');
    }

    return fromJS(messages);
  }
  return new List();
};

const changeModelPassword = (
  saveModel, model, password, setPassword, setPasswordConfirmation
) => () => {
  saveModel({ attrs: new Map({ password }) });
  setPassword('');
  setPasswordConfirmation('');
};

const render = ({
  model = new Map(),
  changePasswordChecked,
  updateModel,
  saveModel,
  setChangePasswordChecked,
  password,
  setPassword,
  passwordConfirmation,
  setPasswordConfirmation,
}) => {
  const ownerOrganisationSettings = model.get('ownerOrganisationSettings', new Map()).toJS();

  // Set password input-visible and change-password checked states
  const serverErrors = model.getIn(['errors', 'messages', 'password'], new List());
  const passwordErrors = validatePassword(
    password, passwordConfirmation, ownerOrganisationSettings
  ).concat(password === '' ? serverErrors : new List());
  const hasPasswordErrors = !passwordErrors.isEmpty();
  const canChangePassword = (changePasswordChecked || hasPasswordErrors);
  const passwordInputsVisible = (!model.get('verified') || canChangePassword);
  const passwordGroupClasses = classNames({
    'form-group': true,
    'has-error': hasPasswordErrors
  });
  const onChangeAttr = onChangeModelAttr(updateModel, model);
  const cantSetPassword = password === '' || hasPasswordErrors;

  return (
    <div className="row">
      <div className="col-md-12" >

        {renderVerified(model, styles)}
        {renderName(model, onChangeAttr)}
        {renderEmail(model, onChangeAttr)}
        {renderPasswordChanges(model, onPasswordCheckboxChange(updateModel, model, setChangePasswordChecked), canChangePassword)}

        {passwordInputsVisible && (
          <div className="form-group">
            {renderPassword(password, setPassword, passwordGroupClasses, passwordErrors)}
            {renderPasswordConfirmation(passwordConfirmation, setPasswordConfirmation, passwordGroupClasses)}
            <button
              className="btn btn-primary btn-sm"
              disabled={cantSetPassword}
              onClick={changeModelPassword(
                saveModel,
                model,
                password,
                setPassword,
                setPasswordConfirmation
              )}>
              <i className="ion ion-checkmark" /><span> Set Password</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default compose(
  withStyles(styles),
  withState('changePasswordChecked', 'setChangePasswordChecked', false),
  withState('password', 'setPassword', ''),
  withState('passwordConfirmation', 'setPasswordConfirmation', ''),
  withProps(({ model }) => ({
    schema: 'user',
    id: model.get('_id')
  })),
  withModel
)(render);
