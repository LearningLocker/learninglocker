import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose, setPropTypes, defaultProps } from 'recompose';
import styles from './styles.css';

const enhanceIconButton = compose(
  setPropTypes({
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  }),
  defaultProps({
    disabled: false,
  }),
  withStyles(styles),
);

const renderIconButton = ({ title, onClick, disabled, icon }) => (
  <button
    className={classNames('btn btn-sm btn-inverse', styles.iconButton)}
    title={title}
    onClick={onClick}
    disabled={disabled}>
    <span><i className={icon} /></span>
  </button>
);

export default enhanceIconButton(renderIconButton);
