import React from 'react';
import PropTypes from 'prop-types';
import validateIri from '@learninglocker/xapi-validation/dist/regexValues/iri';
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
  const hasOpenIdError = validateIri(value, ['openid']).length !== 0;
  return (
    <div className={classNames({ 'has-error': hasOpenIdError })}>
      <Input
        value={value}
        placeholder="OpenID URL"
        onChange={onChange}
        onSubmit={onSave}
        inputRef={refValueInput} />
      <ErrorText hasError={value.length !== 0 && hasOpenIdError}>
        Must be a valid URL.
      </ErrorText>
    </div>
  );
};

export default enhance(render);
