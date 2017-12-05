import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
  setPropTypes({
    value: PropTypes.instanceOf(Map),
    onChange: PropTypes.func.isRequired,
  }),
  withStyles(styles)
);

const renderIdentifierTypeEditor = ({ value, onChange }) => {
  return (
    <div>
      <input
        value={value.get('homePage')}
        onChange={(e) => onChange(value.set('homePage', e.target.value))}
        placeholder="Home Page"
        className={classNames(styles.input, 'form-control')} />
      <input
        value={value.get('name')}
        onChange={(e) => onChange(value.set('name', e.target.value))}
        placeholder="Name"
        className={classNames(styles.input, 'form-control')} />
    </div>
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
