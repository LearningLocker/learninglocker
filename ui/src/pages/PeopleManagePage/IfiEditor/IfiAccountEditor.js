import React from 'react';
import PropTypes from 'prop-types';
import validateIri from '@learninglocker/xapi-validation/dist/regexValues/iri';
import { Map } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes, defaultProps } from 'recompose';
import Input from 'ui/components/Input/Input';
import ErrorText from './ErrorText';

const enhance = compose(
  setPropTypes({
    value: PropTypes.instanceOf(Map),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refHomePageInput: PropTypes.func,
    refNameInput: PropTypes.func,
  }),
  defaultProps({
    refHomePageInput: () => { },
    refNameInput: () => { },
  })
);

const render = ({ value, onChange, onSave, refHomePageInput, refNameInput }) => {
  const homePage = value.get('homePage');
  const name = value.get('name');
  const hasHomePageError = validateIri(homePage, ['homepage']).length !== 0;
  const hasNameError = name.length === 0;
  const handleHomePageChange = (newHomePage) => {
    onChange(value.set('homePage', newHomePage));
  };
  const handleNameChange = (newName) => {
    onChange(value.set('name', newName));
  };
  return (
    <div>
      <div className={classNames('form-group', { 'has-error': hasHomePageError })}>
        <Input
          value={homePage}
          placeholder="Website"
          onChange={handleHomePageChange}
          onSubmit={onSave}
          inputRef={refHomePageInput} />
        <ErrorText hasError={homePage.length !== 0 && hasHomePageError}>
          Must be a valid URL.
        </ErrorText>
      </div>
      <div className={classNames({ 'has-error': hasNameError })}>
        <Input
          value={name}
          placeholder="User ID"
          onChange={handleNameChange}
          onSubmit={onSave}
          inputRef={refNameInput} />
      </div>
    </div>
  );
};

export default enhance(render);
