import React, { PropTypes } from 'react';
import validateMailto from 'xapi-validation/dist/regexValues/mailto';
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
  const hasMboxError = validateMailto(value, ['mbox']).length !== 0;
  const handleChange = (newValue) => {
    onChange(`mailto:${newValue}`);
  };
  return (
    <div className={classNames({ 'has-error': hasMboxError })}>
      <Input
        value={value.replace('mailto:', '')}
        placeholder="Email address"
        onChange={handleChange}
        onSubmit={onSave}
        inputRef={refValueInput} />
      <ErrorText hasError={value.length !== 0 && hasMboxError}>
        Must be a valid email address.
      </ErrorText>
    </div>
  );
};

export default enhance(render);
