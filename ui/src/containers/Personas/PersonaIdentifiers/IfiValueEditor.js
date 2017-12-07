import React, { PropTypes } from 'react';
import { compose, setPropTypes, withHandlers, defaultProps } from 'recompose';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
  setPropTypes({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    refValueInput: PropTypes.func,
  }),
  defaultProps({
    refValueInput: () => { },
  }),
  withStyles(styles),
  withHandlers({
    handleKeyDown: ({ onSave }) => (e) => {
      if (e.keyCode === 13) {
        onSave();
      }
    },
  })
);

const renderIdentifierTypeEditor = ({ value, onChange, handleKeyDown, refValueInput }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Identifier Value"
      className="form-control"
      onKeyDown={handleKeyDown}
      ref={refValueInput} />
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
