import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

const iconActiveMixin = css`
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  background: #eee;
`;

const VisualisationIcon = styled.div`
  text-align: center;
  vertical-align: top;
  display: inline-block;
  margin: 3px;
  width: 109px;
  cursor: pointer;
  transition: background 0.2s;
  ${props => props.active && iconActiveMixin || ''}

  &:hover {
    background: #eee;
  }

  img {
    width: 100%;
  }

  h5 {
    text-align: center;
    padding: 0 4px;
    font-size: 12px;
    font-weight: bold;
    margin-top: 0;
  }
`;

/**
 * @param {string} props.title
 * @param {image file} props.srcImage
 * @param {boolean} props.active
 * @param {() => void} props.onClick
 */
const CustomCard = ({
  title,
  srcImage,
  active,
  onClick,
}) => (
  <VisualisationIcon
    onClick={onClick}
    active={active}>
    <img
      src={srcImage}
      alt={title} />
    <h5>{title}</h5>
  </VisualisationIcon>
);

CustomCard.propTypes = {
  title: PropTypes.string.isRequired,
  srcImage: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default React.memo(CustomCard);
