import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, defaultProps } from 'recompose';
import styles from './styles.css';

const enhanceTextIconButton = compose(
  setPropTypes({
    text: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  defaultProps({
    disabled: false,
  }),
  withStyles(styles),
);

const renderTextIconButton = ({ text, onClick, disabled, icon }) => (
  <button
    className={classNames('btn btn-primary btn-sm', styles.textButton)}
    onClick={onClick}
    disabled={disabled}>
    <span><i className={icon} /></span> {text}
  </button>
);

export default enhanceTextIconButton(renderTextIconButton);
