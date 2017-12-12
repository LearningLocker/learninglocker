import React, { PropTypes } from 'react';
import { compose, setPropTypes } from 'recompose';

const enhance = compose(
  setPropTypes({
    value: PropTypes.oneOf(['mbox', 'mbox_sha1sum', 'openid', 'account']).isRequired,
    onChange: PropTypes.func.isRequired,
  }),
);

const render = ({ value, onChange }) => {
  return (
    <select
      className="form-control"
      onChange={(e) => onChange(e.target.value)}
      value={value}>
      <option value="mbox">Email (mbox)</option>
      <option value="mbox_sha1sum">Encrypted Email (mbox_sha1sum)</option>
      <option value="openid">Open ID (openid)</option>
      <option value="account">Website Account (account)</option>
    </select>
  );
};

export default enhance(render);
