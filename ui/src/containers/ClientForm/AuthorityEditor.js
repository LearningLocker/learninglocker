import React, { PropTypes } from 'react';
import DebounceInput from 'react-debounce-input';
import { Map } from 'immutable';
import { compose, setPropTypes, shouldUpdate, withHandlers } from 'recompose';

const defaultIfis = new Map({
  mbox: 'mailto:hello@learninglocker.net',
  account: new Map({
    homePage: 'http://learninglocker.net',
    name: 'New Client',
  }),
  openid: 'http://learninglocker.net/openid/example',
  mbox_sha1sum: '53d04bc579b8b4d082ca4a530642845e2c0bfe74',
});

const getCurrentIfi = (authority) => {
  if (authority.has('mbox')) return 'mbox';
  if (authority.has('account')) return 'account';
  if (authority.has('openid')) return 'openid';
  if (authority.has('mbox_sha1sum')) return 'mbox_sha1sum';
};

const enhance = compose(
  setPropTypes({
    authority: PropTypes.instanceOf(Map).isRequired,
    onAuthorityChange: PropTypes.func.isRequired,
  }),
  shouldUpdate((prev, next) => !(
    prev.authority.equals(next.authority)
  )),
  withHandlers({
    handleIfiChange: ({ authority, onAuthorityChange }) => (event) => {
      const ifi = event.target.value;
      const value = defaultIfis.get(ifi);
      onAuthorityChange(new Map({
        objectType: 'Agent',
        name: authority.get('name'),
        [ifi]: value,
      }));
    },
    handleFieldChange: ({ authority, onAuthorityChange }) => (keyPath, event) => {
      const value = event.target.value;
      onAuthorityChange(authority.setIn(keyPath, value));
    },
  })
);

const renderIfiSelector = ({ authority, handleIfiChange }) =>
  <select defaultValue={getCurrentIfi(authority)} onChange={handleIfiChange} >
    <option value="mbox">Email</option>
    <option value="account">Account</option>
    <option value="openid">Open ID</option>
    <option value="mbox_sha1sum">Encrypted Email</option>
  </select>;

const renderFieldEditor = ({ authority, label, keyPath, handleFieldChange }) =>
  <div className="form-group" key={keyPath.join('.')}>
    <label htmlFor={keyPath.join('.')}>{label}</label>
    <DebounceInput
      id={keyPath.join('.')}
      className="form-control"
      debounceTimeout={377}
      value={authority.getIn(keyPath)}
      onChange={event => handleFieldChange(keyPath, event)} />
  </div>;

const renderAccountEditor = ({ authority, handleFieldChange }) =>
  <div>
    {renderFieldEditor({
      authority,
      label: 'Authority Account Home Page',
      keyPath: ['account', 'homePage'],
      handleFieldChange
    })}
    {renderFieldEditor({
      authority,
      label: 'Authority Account Name',
      keyPath: ['account', 'name'],
      handleFieldChange
    })}
  </div>;

const renderIfiEditor = ({ authority, handleFieldChange }) => {
  const ifi = getCurrentIfi(authority);
  const renderField = label => renderFieldEditor({
    authority,
    label,
    keyPath: [ifi],
    handleFieldChange
  });

  switch (ifi) {
    case 'mbox':
      return renderField('Authority Email');
    case 'openid':
      return renderField('Authority Open ID');
    case 'mbox_sha1sum':
      return renderField('Authority Encrypted Email');
    case 'account':
      return renderAccountEditor({ authority, handleFieldChange });
    default:
      return renderField('Authority');
  }
};

const render = ({ authority, handleFieldChange, handleIfiChange }) =>
  <div>
    <div className="form-group">
      {renderIfiSelector({ authority, handleIfiChange })}
    </div>
    <div className="form-group">
      {renderFieldEditor({
        authority,
        label: 'Authority Name',
        keyPath: ['name'],
        handleFieldChange
      })}
    </div>
    <div>
      {renderIfiEditor({ authority, handleFieldChange })}
    </div>
  </div>;

export default enhance(render);
