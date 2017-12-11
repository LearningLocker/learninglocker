import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps } from 'recompose';
import classNames from 'classnames';
import Input from 'ui/components/Input/Input';

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
  return (
    <Input
      value={value}
      placeholder="Identifier Value"
      onChange={onChange}
      onSubmit={onSave}
      inputRef={refValueInput} />
  );
};

export default enhance(render);
