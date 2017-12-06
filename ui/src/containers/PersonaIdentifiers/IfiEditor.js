import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps } from 'recompose';
import IfiAccountEditor from './IfiAccountEditor';
import IfiValueEditor from './IfiValueEditor';

const enhanceIfiEditor = compose(
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

const renderIfiEditor = ({ identifierType, value, onChange, onSave, refFirstInput }) => {
  return (identifierType === 'account'
    ? (
      <IfiAccountEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refHomePageInput={refFirstInput} />
    )
    : (
      <IfiValueEditor
        value={value}
        onChange={onChange}
        onSave={onSave}
        refValueInput={refFirstInput} />
    )
  );
};

export default enhanceIfiEditor(renderIfiEditor);
