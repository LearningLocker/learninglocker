import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, defaultProps } from 'recompose';
import IfiAccountEditor from './IfiAccountEditor';
import IfiMboxEditor from './IfiMboxEditor';
import IfiMboxShaEditor from './IfiMboxShaEditor';
import IfiOpenIdEditor from './IfiOpenIdEditor';

const enhance = compose(
  setPropTypes({
    identifierType: PropTypes.oneOf(['mbox', 'mbox_sha1sum', 'openid', 'account']).isRequired,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refFirstInput: PropTypes.func,
  }),
  defaultProps({
    refFirstInput: () => { },
  })
);

const render = ({ identifierType, value, onChange, onSave, refFirstInput }) => {
  switch (identifierType) {
    case 'account': return (
      <IfiAccountEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refHomePageInput={refFirstInput} />
    );
    case 'mbox': return (
      <IfiMboxEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refValueInput={refFirstInput} />
    );
    case 'openid': return (
      <IfiOpenIdEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refValueInput={refFirstInput} />
    );
    case 'mbox_sha1sum': return (
      <IfiMboxShaEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refValueInput={refFirstInput} />
    );
    default: return (
      <span>Unknown identifier type {identifierType}</span>
    );
  }
};

export default enhance(render);
