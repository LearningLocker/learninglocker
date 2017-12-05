import React, { PropTypes } from 'react';
import { compose, setPropTypes } from 'recompose';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
  setPropTypes({
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }),
  withStyles(styles)
);

const renderIdentifierTypeEditor = ({ value, onChange }) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Identifier Value"
      className={classNames(styles.input, 'form-control')} />
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
