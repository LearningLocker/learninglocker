import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import classNames from 'classnames';
import { compose, setPropTypes, withHandlers, defaultProps } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const enhanceIdentifierTypeEditor = compose(
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

const renderIdentifierTypeEditor = ({
  value,
  onChange,
  handleEnterSave,
  refHomePageInput,
  refNameInput,
}) => {
  return (
    <div>
      <input
        value={value.get('homePage')}
        onChange={(e) => onChange(value.set('homePage', e.target.value))}
        placeholder="Home Page"
        className={classNames(styles.input, 'form-control')}
        onKeyDown={handleEnterSave}
        ref={refHomePageInput} />
      <input
        value={value.get('name')}
        onChange={(e) => onChange(value.set('name', e.target.value))}
        placeholder="Name"
        className={classNames(styles.input, 'form-control')}
        onKeyDown={handleEnterSave}
        ref={refNameInput} />
    </div>
  );
};

export default enhanceIdentifierTypeEditor(renderIdentifierTypeEditor);
