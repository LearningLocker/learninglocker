import React, { PropTypes } from 'react';
import { compose, setPropTypes, withHandlers } from 'recompose';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
  setPropTypes({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  }),
  withStyles(styles),
  withHandlers({
    handleEnterSave: ({ onSave }) => (e) => {
      if (e.keyCode === 13) {
        onSave();
      }
    },
  })
);

const renderIdentifierTypeEditor = ({ value, onChange, handleEnterSave }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Identifier Value"
      className={classNames(styles.input, 'form-control')}
      onKeyDown={handleEnterSave} />
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
