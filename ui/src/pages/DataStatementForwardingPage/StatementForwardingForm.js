import React from 'react';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import classNames from 'classnames';
import { withProps, compose, withHandlers } from 'recompose';
import { getAuthHeaders, getHeaders } from 'lib/helpers/statementForwarding';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import { AUTH_TYPES, AUTH_TYPE_NO_AUTH, STATAMENT_FORWARDING_MAX_RETRIES } from 'lib/constants/statementForwarding';
import Switch from 'ui/components/Material/Switch';
import ValidationList from 'ui/components/ValidationList';
import TableInput from 'ui/components/TableInput';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';
import QueryBuilder from 'ui/containers/QueryBuilder';
import activeOrgSelector from 'ui/redux/modules/activeOrgSelector';
import { withModel } from 'ui/utils/hocs';

const schema = 'statementForwarding';

const updateHandlers = withHandlers({
  changeActive: ({ updateModel }) => value => updateModel({
    path: ['active'],
    value
  }),
  changeDescription: ({ updateModel }) => (event) => {
    const newDescription = event.target.value;

    return updateModel({
      path: ['description'],
      value: newDescription
    });
  },
  changeProtocol: ({ updateModel, model }) => (event) => {
    const newProtocol = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('protocol', newProtocol)
    });
  },
  changeUrl: ({ updateModel, model }) => (event) => {
    const newUrl = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('url', newUrl)
    });
  },
  changeAuthType: ({ updateModel, model }) => (event) => {
    const newAuthType = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('authType', newAuthType)
    });
  },
  changeSecret: ({ updateModel, model }) => (event) => {
    const newSecret = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('secret', newSecret)
    });
  },
  changeBasicUsername: ({ updateModel, model }) => (event) => {
    const newUsername = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('basicUsername', newUsername)
    });
  },
  changeBasicPassword: ({ updateModel, model }) => (event) => {
    const newPassword = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('basicPassword', newPassword)
    });
  },
  changeQuery: ({ updateModel }) => value => updateModel({
    path: ['query'],
    value
  }),
  changeMaxRetries: ({ updateModel, model }) => (event) => {
    const newMaxRetriers = event.target.value;
    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set('maxRetries', newMaxRetriers)
    });
  },
  changeHeaders: ({ updateModel, model }) => (newHeaders) => {
    const newHeadersString = JSON.stringify(newHeaders.toJS());

    return updateModel({
      path: ['configuration'],
      value: model.get('configuration', new Map()).set(
        'headers',
        newHeadersString
      )
    });
  },
  changeFullDocument: ({ updateModel }) => value => updateModel({
    path: ['fullDocument'],
    value
  }),
  changeSendAttachments: ({ updateModel }) => value => updateModel({
    path: ['sendAttachments'],
    value
  }),
  onChangeTimezone: ({ updateModel }) => value => updateModel({
    path: ['timezone'],
    value
  }),
  onChangeQuery: ({ updateModel }) => value => updateModel({
    path: ['query'],
    value
  }),
});

const withProtocols = withProps(() => ({
  protocols: ['http', 'https']
}));

const withAuthTypes = withProps(() => ({
  authTypes: AUTH_TYPES
}));

class StatementForwardingForm extends React.Component {

  componentDidMount = () => {
    this.updateQueryIfUpdated();
  }

  componentDidUpdate = () => {
    this.updateQueryIfUpdated();
  }

  updateQueryIfUpdated = () => {
    const { model, organisationModel, onChangeQuery } = this.props;
    const timezone = model.get('timezone') || organisationModel.get('timezone');

    const query = model.get('query', new Map({}));
    const timezoneUpdated = update$dteTimezone(query, timezone);

    // Update query when timezone offset in the query is changed
    if (!timezoneUpdated.equals(query)) {
      onChangeQuery(timezoneUpdated);
    }
  }

  render = () => {
    const {
      model, // statementForwarding
      organisationModel,
      changeDescription,
      changeProtocol,
      changeUrl,
      protocols,
      changeActive,
      changeAuthType,
      changeSecret,
      changeBasicUsername,
      changeBasicPassword,
      changeQuery,
      authTypes,
      changeMaxRetries,
      changeHeaders,
      changeFullDocument,
      changeSendAttachments,
      onChangeTimezone,
    } = this.props;

    const orgTimezone = organisationModel.get('timezone', 'UTC');

    return (
      <div>
        <div className="row">
          <div className="col-md-12">

            <div className="form-group">
              <Switch
                label="Active?"
                onChange={changeActive}
                checked={model.get('active', false)} />
            </div>


            <div className="form-group">
              <label htmlFor={`${model.get('_id')}descriptionInput`}>Name</label>
              <input
                id={`${model.get('_id')}descriptionInput`}
                className="form-control"
                placeholder="Short description of this statement forwarder"
                value={model.get('description', '')}
                onChange={changeDescription} />
            </div>

            <div className="form-group">
              <label htmlFor={`${model.get('_id')}fullDocumentToggle`}>Send full database record?</label>
              <span className="help-block">Should the Statement Forward send the entire database record to the defined URL? If forwarding to an LRS, this option should be left disabled.</span>
              <Switch
                id={`${model.get('_id')}fullDocumentToggle`}
                label="Enabled"
                onChange={changeFullDocument}
                checked={model.get('fullDocument', false)} />
            </div>

            <div className="form-group">
              <label htmlFor={`${model.get('_id')}sendAttachments`}>Send attachments?</label>
              <span className="help-block">Should the Statement Forward send the statement&#39;s attachments?</span>
              <Switch
                id={`${model.get('_id')}sendAttachments`}
                label="Enabled"
                onChange={changeSendAttachments}
                checked={model.get('sendAttachments', false)} />
            </div>

            <div className="form-group">
              <label htmlFor={`${model.get('_id')}protocolInput`}>Protocol</label>
              <select
                className="form-control"
                onChange={changeProtocol}
                value={model.getIn(['configuration', 'protocol'], 'http')} >
                {protocols.map(protocol => (
                  <option key={protocol} value={protocol}>{protocol}</option>
                  ))}
              </select>
            </div>
            <div
              className={classNames({
                'form-group': true,
                'has-error': model.getIn(['errors', 'messages', 'configuration.url'], false)
              })} >
              <label htmlFor={`${model.get('_id')}urlInput`}>URL</label>
              <input
                id={`${model.get('_id')}urlInput`}
                className="form-control"
                value={model.getIn(['configuration', 'url'], '')}
                placeholder="URL"
                onChange={changeUrl} />
              {model.getIn(['errors', 'messages', 'configuration.url'], false) &&
                  (<span className="help-block">
                    <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.url'])} />
                  </span>)
                }
            </div>

            <div
              className={classNames({
                'form-group': true,
                'has-error': model.getIn(['errors', 'messages', 'configuration.authType'], false)
              })}>
              <label htmlFor={`${model.get('_id')}authTypeInput`}>Auth Type</label>
              <select
                className="form-control"
                onChange={changeAuthType}
                value={model.getIn(['configuration', 'authType'], AUTH_TYPE_NO_AUTH)}>
                {authTypes.map(authType => (
                  <option key={authType} value={authType}>{authType}</option>
                  ))}
              </select>
              {model.getIn(['errors', 'messages', 'configuration.authType'], false) &&
                  (<span className="help-block">
                    <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.authType'])} />
                  </span>)
                }
            </div>

            {(model.getIn(['configuration', 'authType'], 'token') === 'token') &&
            <div
              className={classNames({
                'form-group': true,
                'has-error': model.getIn(['errors', 'messages', 'configuration.secret'], false)
              })}>
              <label htmlFor={`${model.get('_id')}secretInput`}>Secret Key</label>
              <input
                id={`${model.getIn(['configuration', 'secret'])}secretInput`}
                className="form-control"
                value={model.getIn(['configuration', 'secret'], '')}
                placeholder="Secret Key"
                onChange={changeSecret} />
              {model.getIn(['errors', 'messages', 'configuration.secret'], false) &&
                    (<span className="help-block">
                      <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.secret'])} />
                    </span>)
                  }
            </div>
              }

            {(model.getIn(['configuration', 'authType'], 'token') === 'basic auth') &&
                (<div>
                  <div
                    className={classNames({
                      'form-group': true,
                      'has-error': model.getIn(['errors', 'messages', 'configuration.basicUsername'], false)
                    })}>
                    <label htmlFor={`${model.get('_id')}basicUsernameInput`}>Basic Username</label>
                    <input
                      id={`${model.getIn(['configuration', 'basicUsername'])}basicUsernameInput`}
                      className="form-control"
                      value={model.getIn(['configuration', 'basicUsername'], '')}
                      placeholder="Basic Username"
                      onChange={changeBasicUsername} />
                    {model.getIn(['errors', 'messages', 'configuration.basicUsername'], false) &&
                      (<span className="help-block">
                        <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.basicUsername'])} />
                      </span>)
                    }
                  </div>
                  <div
                    className={classNames({
                      'form-group': true,
                      'has-error': model.getIn(['errors', 'messages', 'configuration.basicPassword'], false)
                    })}>
                    <label htmlFor={`${model.get('_id')}basicPasswordInput`}>Basic Password</label>
                    <input
                      id={`${model.getIn(['configuration', 'basicPassword'])}basicPasswordInput`}
                      className="form-control"
                      value={model.getIn(['configuration', 'basicPassword'], '')}
                      placeholder="Basic Password"
                      onChange={changeBasicPassword} />
                    {model.getIn(['errors', 'messages', 'configuration.basicPassword'], false) &&
                      (<span className="help-block">
                        <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.basicPassword'])} />
                      </span>)
                    }
                  </div>
                </div>)
              }

            <div
              className={classNames({
                'form-group': true,
                'has-error': model.getIn(['errors', 'messages', 'configuration.headers'], false)
              })}>
              <label htmlFor={`${model.get('_id')}headers`}>Headers</label>
              <TableInput
                keyName="Field Name"
                valueName="Field Value"
                staticValues={getAuthHeaders({
                  configuration: model.get('configuration').toJS()
                }).merge(new Map({
                  'Content-Type': model.get('sendAttachments') ? 'multipart/mixed' : 'application/json',
                  'Content-Length': '${Content-Length}', // eslint-disable-line no-template-curly-in-string
                  'X-Experience-API-Version': '${statement.version}', // eslint-disable-line no-template-curly-in-string
                }))}
                values={
                    getHeaders(model)
                  }
                onChange={changeHeaders} />
              {
                  model.getIn(['errors', 'messages', 'configuration.headers'], false) &&
                  (<span className="help-block">
                    <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.headers'])} />
                  </span>)
                }
            </div>

            <div
              className={classNames({
                'form-group': true,
                'has-error': model.getIn(['errors', 'messages', 'configuration.maxRetries'], false)
              })}>
              <label htmlFor={`${model.get('_id')}maxRetries`}>{`Max Retries (0 - ${STATAMENT_FORWARDING_MAX_RETRIES})`}</label>
              <input
                id={`${model.getIn(['configuration', 'maxRetries'], 3)}maxRetries`}
                type="number"
                step="1"
                min="0"
                max={STATAMENT_FORWARDING_MAX_RETRIES}
                className="form-control"
                value={model.getIn(['configuration', 'maxRetries'], 0)}
                placeholder="0"
                onChange={changeMaxRetries} />
              {
                model.getIn(['errors', 'messages', 'configuration.maxRetries'], false) &&
                (
                  <span className="help-block">
                    <ValidationList errors={model.getIn(['errors', 'messages', 'configuration.maxRetries'])} />
                  </span>
                )
              }
            </div>

            <div className="form-group">
              <label htmlFor="StatementForward_TimezoneSelector">Timezone</label>
              <TimezoneSelector
                id="StatementForward_TimezoneSelector"
                value={model.get('timezone', organisationModel.get('timezone', 'UTC'))}
                onChange={onChangeTimezone}
                defaultOption={{
                  label: buildDefaultOptionLabel(orgTimezone),
                  value: orgTimezone,
                }} />
            </div>

            <div className="form-group">
              <QueryBuilder
                timezone={model.get('timezone', null)}
                orgTimezone={organisationModel.get('timezone', 'UTC')}
                componentPath={new List(['statementForwarding', model.get('_id')])}
                query={model.get('query')}
                onChange={changeQuery} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withProps(props => ({
    schema,
    id: props.model.get('_id')
  })),
  withModel,
  withProtocols,
  withAuthTypes,
  updateHandlers,
  connect(state => ({
    organisationModel: activeOrgSelector(state),
  }))
)(StatementForwardingForm);
