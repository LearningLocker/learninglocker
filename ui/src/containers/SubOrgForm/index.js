import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { updateModel } from 'ui/redux/modules/models';
import Checkbox from 'ui/components/Material/Checkbox';
import { TimezoneSelector } from 'ui/components/TimezoneSelector';
import {
  uploadLogo,
  IN_PROGRESS,
  SUCCESS,
  FAILED
} from 'ui/redux/modules/logo';
import SmallSpinner from 'ui/components/SmallSpinner';
import ValidationList from 'ui/components/ValidationList';
import OrgLogo from 'ui/components/OrgLogo';
import uuid from 'uuid';
import DatePicker from 'ui/components/Material/DatePicker';
import { hasScopeSelector } from 'ui/redux/modules/auth';
import { SITE_ADMIN } from 'lib/constants/scopes';

const schema = 'organisation';

class SubOrgForm extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    uploadLogo: PropTypes.func,
    uploadState: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
    isSiteAdmin: PropTypes.bool
  };

  static defaultProps = {
    model: new Map()
  };

  constructor(props) {
    super(props);

    this.state = {
      fileName: '',
      fileHandle: null
    };
  }

  onChangeAttr = (attr, e) => {
    this.props.updateModel({
      schema,
      id: this.props.model.get('_id'),
      path: attr,
      value: e.target.value
    });
  };

  changeSettingsAttr = (attr, value) => {
    const { model } = this.props;
    const modelId = model.get('_id');
    const oldSettings = model.get('settings');
    const newSettings = oldSettings.set(attr, value);

    this.props.updateModel({
      schema: 'organisation',
      id: modelId,
      path: ['settings'],
      value: newSettings
    });
  };

  onChangeSettingsAttr = (attr, e) => {
    this.changeSettingsAttr(attr, e.target.value);
  };

  onChangeBooleanSetting = (attr, checked) => {
    this.changeSettingsAttr(attr, checked);
  };

  onExpirationChange = (value) => {
    const { model } = this.props;
    const modelId = model.get('_id');

    this.props.updateModel({
      schema: 'organisation',
      id: modelId,
      path: ['expiration'],
      value
    });
  };

  onExpirationDismiss = () => {
    const { model } = this.props;
    const modelId = model.get('_id');

    this.props.updateModel({
      schema: 'organisation',
      id: modelId,
      path: ['expiration'],
      value: null
    });
  }

  handleFile = (e) => {
    this.setState({ fileName: e.target.files[0].name });
    this.setState({ fileHandle: e.target.files[0] });
  };

  handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (this.state.fileHandle) {
      const file = this.state.fileHandle;
      this.props.uploadLogo(schema, this.props.model.get('_id'), file);
      this.setState({ fileName: '' });
      this.setState({ fileHandle: null });
    }
  };

  renderButtonContent = () => {
    const exportProgress = this.props.uploadState.getIn([
      schema,
      this.props.model.get('_id'),
      'uploadState'
    ]);

    switch (exportProgress) {
      case IN_PROGRESS:
        return <SmallSpinner />;
      case SUCCESS:
        return <i className="icon animated fadeIn ion-checkmark" />;
      case FAILED:
        return <i className="icon animated fadeIn ion-close" />;
      default: {
        return <span>Upload</span>;
      }
    }
  };

  renderNameSetting = (model) => {
    const nameId = uuid.v4();
    return (
      <div className="form-group">
        <label htmlFor={nameId}>Name</label>
        <input
          id={nameId}
          className="form-control"
          placeholder="Name for this organisation"
          value={model.get('name', '')}
          onChange={this.onChangeAttr.bind(null, 'name')} />
      </div>
    );
  };

  renderLockoutSetting = (errorMessages, settings) => {
    const lockoutId = uuid.v4();
    const attemptsId = uuid.v4();
    return (
      <div>
        <div
          className={classNames({
            'form-group': true,
            'has-error': errorMessages.has('settings.LOCKOUT_ATTEMPS')
          })}>
          <label htmlFor={attemptsId}>Allowed attempts</label>
          <input
            id={attemptsId}
            className="form-control"
            placeholder="How many incorrect attempts to login does the user have before being locked out"
            value={settings.get('LOCKOUT_ATTEMPS')}
            onChange={this.onChangeSettingsAttr.bind(null, 'LOCKOUT_ATTEMPS')} />

          {errorMessages.has('settings.LOCKOUT_ATTEMPS') &&
            <span className="help-block">
              <ValidationList
                errors={errorMessages.get('settings.LOCKOUT_ATTEMPS')} />
            </span>}
        </div>
        <div
          className={classNames({
            'form-group': true,
            'has-error': errorMessages.has('settings.LOCKOUT_SECONDS')
          })}>
          <label htmlFor={lockoutId}>Lockout time (seconds)</label>
          <input
            id={lockoutId}
            className="form-control"
            placeholder="How many seconds will the user be locked out for?"
            value={settings.get('LOCKOUT_SECONDS')}
            onChange={this.onChangeSettingsAttr.bind(null, 'LOCKOUT_SECONDS')} />

          {errorMessages.has('settings.LOCKOUT_SECONDS') &&
            <span className="help-block">
              <ValidationList
                errors={errorMessages.get('settings.LOCKOUT_SECONDS')} />
            </span>}
        </div>
      </div>
    );
  };

  renderPasswordHistoryCheck = (errorMessages, settings) => {
    const passwordTotalId = uuid.v4();
    return (
      <div>
        <div
          className={classNames({
            'form-group': true,
            'has-error': errorMessages.has('settings.PASSWORD_HISTORY_TOTAL')
          })}>
          <label htmlFor={passwordTotalId}>
            Check against how many previous passwords?
          </label>
          <input
            id={passwordTotalId}
            className="form-control"
            placeholder="How many previous consecutive passwords are checked?"
            value={settings.get('PASSWORD_HISTORY_TOTAL')}
            onChange={this.onChangeSettingsAttr.bind(
              null,
              'PASSWORD_HISTORY_TOTAL'
            )} />

          {errorMessages.has('settings.PASSWORD_HISTORY_TOTAL') &&
            <span className="help-block">
              <ValidationList
                errors={errorMessages.get('settings.PASSWORD_HISTORY_TOTAL')} />
            </span>}
        </div>
      </div>
    );
  };

  renderLogoSetting = () => {
    const logoId = uuid.v4();
    return (
      <form onSubmit={this.handleSubmit} encType="multipart/form-data">
        <label
          className="btn btn-primary btn-inverse btn-default"
          htmlFor={logoId}>
          <input
            id={logoId}
            name="logo"
            type="file"
            accept="image/*"
            onChange={this.handleFile}
            style={{ display: 'none' }} />
          Choose a Logo
        </label>
        <span> {this.state.fileName}</span>
      </form>
    );
  };

  renderMinPasswordSetting = (errorMessages, settings) => {
    const minPasswordId = uuid.v4();
    return (
      <div
        className={classNames({
          'form-group': true,
          'has-error': errorMessages.has('settings.PASSWORD_MIN_LENGTH')
        })}>
        <label htmlFor={minPasswordId}>Minimum allowed password length</label>
        <input
          id={minPasswordId}
          className="form-control"
          placeholder="Minimum characters allowed in a user's password"
          value={settings.get('PASSWORD_MIN_LENGTH')}
          onChange={this.onChangeSettingsAttr.bind(null, 'PASSWORD_MIN_LENGTH')} />

        {errorMessages.has('settings.PASSWORD_MIN_LENGTH') &&
          <span className="help-block">
            <ValidationList
              errors={errorMessages.get('settings.PASSWORD_MIN_LENGTH')} />
          </span>}
      </div>
    );
  };

  renderPasswordRegexSetting = (errorMessages, settings) => {
    const regexId = uuid.v4();
    return (
      <div
        className={classNames({
          'form-group': true,
          'has-error': errorMessages.has('settings.PASSWORD_CUSTOM_REGEX')
        })}>
        <label htmlFor={regexId}>Password Regular Expression</label>
        <input
          id={regexId}
          className="form-control"
          placeholder="Enter a valid RegEx to be used to check passwords with"
          value={settings.get('PASSWORD_CUSTOM_REGEX') || ''}
          onChange={this.onChangeSettingsAttr.bind(
            null,
            'PASSWORD_CUSTOM_REGEX'
          )} />

        {errorMessages.has('settings.PASSWORD_CUSTOM_REGEX') &&
          <span className="help-block">
            <ValidationList
              errors={errorMessages.get('settings.PASSWORD_CUSTOM_REGEX')} />
          </span>}
      </div>
    );
  };

  renderCustomMessageSetting = (errorMessages, settings) => {
    const messageId = uuid.v4();
    return (
      <div
        className={classNames({
          'form-group': true,
          'has-error': errorMessages.has('settings.PASSWORD_CUSTOM_MESSAGE')
        })}>
        <label htmlFor={messageId}>Custom message</label>
        <input
          id={messageId}
          className="form-control"
          placeholder="This message will be used to inform the user of the password requirements"
          value={settings.get('PASSWORD_CUSTOM_MESSAGE') || ''}
          onChange={this.onChangeSettingsAttr.bind(
            null,
            'PASSWORD_CUSTOM_MESSAGE'
          )} />

        {errorMessages.has('settings.PASSWORD_CUSTOM_MESSAGE') &&
          <span className="help-block">
            <ValidationList
              errors={errorMessages.get('settings.PASSWORD_CUSTOM_MESSAGE')} />
          </span>}
      </div>
    );
  };

  render = () => {
    const { model } = this.props;
    const settings = model.get('settings');
    const errorMessages = model.getIn(['errors', 'messages'], new Map());
    const usageStats = model.get('usageStats');

    return (
      <div className="row">
        <div className="col-md-12">
          <fieldset>
            {this.renderNameSetting(model)}

            <div className="form-group">
              <label htmlFor="SubOrgForm_TimezoneSelector">Timezone</label>
              <TimezoneSelector
                id="SubOrgForm_TimezoneSelector"
                value={model.get('timezone', 'UTC')}
                onChange={value => this.props.updateModel({
                  schema,
                  id: this.props.model.get('_id'),
                  path: 'timezone',
                  value
                })} />
            </div>

            <div className="form-group">
              <OrgLogo
                organisation={model}
                style={{
                  width: '75px',
                  backgroundColor: '#FFF',
                  height: 'auto'
                }} />
            </div>

            <div className="form-group">
              {this.renderLogoSetting()}
              <br />
              <a
                onClick={this.handleSubmit}
                className="btn btn-primary btn-inverse btn-sm">
                {this.renderButtonContent()}
              </a>
            </div>
          </fieldset>

          <br />

          <fieldset>
            <legend className="pageHeader">Auth settings</legend>
            {this.renderMinPasswordSetting(errorMessages, settings)}
            <hr />

            {!settings.get('PASSWORD_USE_CUSTOM_REGEX') &&
              <div>
                <div className="form-group">
                  <Checkbox
                    label="Require at least one letter"
                    onChange={this.onChangeBooleanSetting.bind(
                      null,
                      'PASSWORD_REQUIRE_ALPHA'
                    )}
                    checked={settings.get('PASSWORD_REQUIRE_ALPHA')} />
                </div>

                <div className="form-group">
                  <Checkbox
                    label="Require at least one number"
                    onChange={this.onChangeBooleanSetting.bind(
                      null,
                      'PASSWORD_REQUIRE_NUMBER'
                    )}
                    checked={settings.get('PASSWORD_REQUIRE_NUMBER')} />
                </div>
              </div>}

            <div className="form-group">
              <Checkbox
                label="Use custom password requirements"
                onChange={this.onChangeBooleanSetting.bind(
                  null,
                  'PASSWORD_USE_CUSTOM_REGEX'
                )}
                checked={settings.get('PASSWORD_USE_CUSTOM_REGEX')} />
            </div>

            {settings.get('PASSWORD_USE_CUSTOM_REGEX') &&
              <div>
                <p>
                  Using custom password requirements allows you to create your own validation rules
                  using a Regular Expression.
                </p>
                {this.renderPasswordRegexSetting(errorMessages, settings)}
                {this.renderCustomMessageSetting(errorMessages, settings)}
              </div>}

            <hr />

            <div className="form-group">
              <Checkbox
                label="Lock user accounts after wrong attempts"
                onChange={this.onChangeBooleanSetting.bind(
                  null,
                  'LOCKOUT_ENABLED'
                )}
                checked={settings.get('LOCKOUT_ENABLED')} />
            </div>

            {settings.get('LOCKOUT_ENABLED') &&
              this.renderLockoutSetting(errorMessages, settings)}

            <hr />

            <div className="form-group">
              <Checkbox
                label="Check password history"
                onChange={this.onChangeBooleanSetting.bind(
                  null,
                  'PASSWORD_HISTORY_CHECK'
                )}
                checked={settings.get('PASSWORD_HISTORY_CHECK')} />
            </div>

            {settings.get('PASSWORD_HISTORY_CHECK') &&
              this.renderPasswordHistoryCheck(errorMessages, settings)}
          </fieldset>

          <div className="from-group">
            <p style={{ padding: 8 }}>Expiry</p>
            <DatePicker
              value={model.get('expiration') ? new Date(model.get('expiration')) : null}
              onChange={this.onExpirationChange}
              onDismiss={this.onExpirationDismiss}
              readonly={!this.props.isSiteAdmin} />
          </div>

          {this.props.isSiteAdmin && usageStats &&
            <div className="form-group">
              <p>
                Usage: {usageStats.get('OWN_COUNT').toLocaleString('en')} statements
                and approximately {Math.round(usageStats.get('OWN_ESTIMATED_BYTES') / 1000000 * 100) / 100} MB
              </p>

              {usageStats.get('HAS_CHILDREN') &&
                <p>
                  Total Usage: {usageStats.get('TOTAL_COUNT').toLocaleString('en')} statements
                  and approximately {Math.round(usageStats.get('TOTAL_ESTIMATED_BYTES') / 1000000 * 100) / 100} MB
                </p>
              }
            </div>
          }
        </div>
      </div>
    );
  };
}

export default compose(
  connect(
    state =>
      ({
        uploadState: state.logo,
        isSiteAdmin: hasScopeSelector(SITE_ADMIN)(state)
      }),
    {
      updateModel,
      uploadLogo
    }
  )
)(SubOrgForm);
