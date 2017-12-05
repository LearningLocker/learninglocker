import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes, withHandlers } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
  setPropTypes({
    value: PropTypes.instanceOf(Map),
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
    <div>
      <input
        value={value.get('homePage')}
        onChange={(e) => onChange(value.set('homePage', e.target.value))}
        placeholder="Home Page"
        className={classNames(styles.input, 'form-control')}
        onKeyDown={handleEnterSave} />
      <input
        value={value.get('name')}
        onChange={(e) => onChange(value.set('name', e.target.value))}
        placeholder="Name"
        className={classNames(styles.input, 'form-control')}
        onKeyDown={handleEnterSave} />
    </div>
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
