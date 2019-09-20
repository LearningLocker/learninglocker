import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes } from 'recompose';
import { identifierTypeDisplays } from '../constants';

const enhance = compose(
  setPropTypes({
    value: PropTypes.oneOf(['mbox', 'mbox_sha1sum', 'openid', 'account']).isRequired,
    onChange: PropTypes.func.isRequired,
  }),
);

const render = ({ value, onChange }) => (
  <select
    className="form-control"
    onChange={e => onChange(e.target.value)}
    value={value}>
    <option value="mbox">{identifierTypeDisplays.mbox}</option>
    <option value="mbox_sha1sum">{identifierTypeDisplays.mbox_sha1sum}</option>
    <option value="openid">{identifierTypeDisplays.openid}</option>
    <option value="account">{identifierTypeDisplays.account}</option>
  </select>
  );

export default enhance(render);
