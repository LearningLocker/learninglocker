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
  const hasSha1Error = value.length === 0;
  return (
    <div className={classNames({ 'has-error': hasSha1Error })}>
      <Input
        value={value}
        placeholder="Sha1 encrypted email address"
        onChange={onChange}
        onSubmit={onSave}
        inputRef={refValueInput} />
    </div>
  );
};

export default enhance(render);
