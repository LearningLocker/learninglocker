import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose, setPropTypes, defaultProps } from 'recompose';
import styled from 'styled-components';

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
);

const Button = styled.button`
  margin: 0 1px;
`;

const renderTextIconButton = ({ text, onClick, disabled, icon }) => (
  <Button
    className={classNames('btn btn-primary btn-sm')}
    onClick={onClick}
    disabled={disabled} >
    <span><i className={icon} /></span> {text}
  </Button>
);

export default enhanceTextIconButton(renderTextIconButton);
