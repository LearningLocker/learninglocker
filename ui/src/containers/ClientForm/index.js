import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, withProps, withHandlers, setPropTypes } from 'recompose';
import { map } from 'lodash';
import btoa from 'btoa';
import Checkbox from 'ui/components/Material/Checkbox';
import Dropdown from 'ui/components/Material/Dropdown';
import { withSchema, withModel } from 'ui/utils/hocs';
import { API_SCOPES, XAPI_SCOPES } from 'lib/constants/scopes';
import ValidationList from 'ui/components/ValidationList';
import AuthorityEditor from './AuthorityEditor';
import styles from './styles.css';

const renderNoStore = () => [{ value: 'No LRSs available', label: 'No LRSs available', disabled: true }];

const renderDefaultStore = () => ({ value: null, label: '~ No store ~' });

const renderStoreItems = stores =>
  stores.valueSeq().map(store => (
    { value: store.get('_id'), label: store.get('title') }
  ));

const renderStoreDropdown = compose(
  withSchema('lrs')
)(({ models, onSelect, selectedId, elemId }) =>
  <Dropdown
    label="LRS (optional)"
    id={elemId}
    value={selectedId || 'default'}
    onChange={onSelect}
    source={
      models.size > 0 ?
      [renderDefaultStore(), ...renderStoreItems(models)] :
      renderNoStore()
    } />
);

const renderAuthorityEditor = (handleAttrChange, model) => {
  const errors = model.getIn(['errors', 'messages', 'authority'], new List());
  return (
    <div id="authorityEditor">
      <AuthorityEditor
        authority={model.get('authority')}
        onAuthorityChange={handleAttrChange.bind(null, 'authority')} />
      {!errors.isEmpty() && (
        <span className="help-block">
          <ValidationList errors={errors} />
        </span>
      )}
    </div>
  );
};

const renderScopes = (setScopes, onChangeScopes, selectedScopes) =>
  map(selectedScopes, (name, scope) => (
    <Checkbox
      key={scope}
      label={name}
      checked={setScopes.includes(scope)}
      onChange={onChangeScopes.bind(null, scope)} />
  ));

const enhance = compose(
  withStyles(styles),
  withProps(({ model }) => ({
    schema: 'client',
    id: model.get('_id'),
  })),
  withModel,
  withHandlers({
    handleAttrChange: ({ updateModel }) =>
      (attr, value) => {
        updateModel({ path: [attr], value });
      },
  }),
  withHandlers({
    handleTargetValueChange: ({ handleAttrChange }) =>
      (attr, { target: { value } }) => {
        handleAttrChange(attr, value);
      },
    onChangeScopes: ({ model, handleAttrChange }) =>
      (scope, checked) => {
        const scopesSet = model.get('scopes').toSet();
        const newScopes = checked ? scopesSet.add(scope) : scopesSet.delete(scope);
        handleAttrChange('scopes', newScopes.toList());
      },
  }),
  setPropTypes({
    model: PropTypes.instanceOf(Map).isRequired,
    handleAttrChange: PropTypes.func.isRequired,
    handleTargetValueChange: PropTypes.func.isRequired,
    onChangeScopes: PropTypes.func.isRequired,
  })
);

export const render = ({ model, handleAttrChange, handleTargetValueChange, onChangeScopes }) => {
  const basicKey = model.getIn(['api', 'basic_key'], '');
  const basicSecret = model.getIn(['api', 'basic_secret'], '');
  const _id = model.get('_id', '');
  const isTrusted = model.get('isTrusted', false);
  const title = model.get('title', '');
  const lrsId = model.get('lrs_id', '');
  const scopes = model.get('scopes', new List());

  return (
    <div className="row">
      <div className="col-md-12" >
        <div className="form-group">
          <label htmlFor="lrsTitleInput">Title</label>
          <input
            className="form-control"
            placeholder="Short name for this client"
            value={title}
            onChange={handleTargetValueChange.bind(null, 'title')} />
        </div>

        <div className="form-group">
          <Checkbox
            label="Enabled?"
            onChange={handleAttrChange.bind(null, 'isTrusted')}
            checked={isTrusted} />
        </div>

        <div className="form-group">
          <label htmlFor="basicKey">Key</label>
          <p className="help-block">{basicKey}</p>
        </div>
        <div className="form-group">
          <label htmlFor="basicSecret">Secret</label>
          <p className="help-block">{basicSecret}</p>
        </div>
        <div className="form-group">
          <label htmlFor="basicAuth">Basic auth</label>
          <p className={`help-block ${styles.strongwrap}`}>{btoa(`${basicKey}:${basicSecret}`)}</p>
        </div>

        <div className="form-group">
          <label htmlFor="overallScopesCheckboxGroup">Overall Scopes</label>
          {renderScopes(scopes, onChangeScopes, API_SCOPES)}
        </div>

        <div className="page-header">
          <h4>xAPI</h4>
        </div>
        <div className="form-group">
          <div>
            {renderStoreDropdown({
              filter: new Map(),
              elemId: `lrsInput${_id}`,
              selectedId: lrsId,
              onSelect: handleAttrChange.bind(null, 'lrs_id'),
            })}
          </div>
        </div>

        {lrsId &&
          <div>
            <div className="form-group">
              <label htmlFor="xapiScopesCheckboxGroup">Scopes</label>
              {renderScopes(scopes, onChangeScopes, XAPI_SCOPES)}
            </div>
            <div className="form-group">
              <label htmlFor="authorityEditor">Authority</label>
              {renderAuthorityEditor(handleAttrChange, model)}
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default enhance(render);
