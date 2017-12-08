import React, { PropTypes } from 'react';
import { compose, setPropTypes, defaultProps } from 'recompose';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Input from 'ui/components/Input/Input';
import styles from '../styles.css';

const enhance = compose(
  setPropTypes({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refValueInput: PropTypes.func,
  }),
  defaultProps({
    refValueInput: () => { },
  }),
  withStyles(styles)
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
