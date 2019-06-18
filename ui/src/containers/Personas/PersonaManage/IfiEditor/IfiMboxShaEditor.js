import validateSha1 from '@learninglocker/xapi-validation/dist/regexValues/sha1';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, setPropTypes, defaultProps } from 'recompose';
import classNames from 'classnames';
import Input from 'ui/components/Input/Input';
import ErrorText from './ErrorText';

const enhance = compose(
  setPropTypes({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refValueInput: PropTypes.func,
  }),
  defaultProps({
    refValueInput: () => { },
  })
);

const render = ({ value, onChange, onSave, refValueInput }) => {
  const hasSha1Error = validateSha1(value, ['mbox_sha1sum']).length !== 0;
  return (
    <div className={classNames({ 'has-error': hasSha1Error })}>
      <Input
        value={value}
        placeholder="Sha1 encrypted email address"
        onChange={onChange}
        onSubmit={onSave}
        inputRef={refValueInput} />
      <ErrorText hasError={value.length !== 0 && hasSha1Error}>
        Must be valid Sha1 text.
      </ErrorText>
    </div>
  );
};

export default enhance(render);
