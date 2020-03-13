import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose, setPropTypes, defaultProps } from 'recompose';
import styled from 'styled-components';

const Button = styled.button`
  width: 33px;
  margin: 0 1px;
`;

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
);

const renderIconButton = ({ title, onClick, disabled, icon }) => (
  <Button
    className={classNames('btn btn-sm btn-inverse')}
    title={title}
    onClick={onClick}
    disabled={disabled} >
    <span><i className={icon} /></span>
  </Button>
);

export default enhanceIconButton(renderIconButton);
