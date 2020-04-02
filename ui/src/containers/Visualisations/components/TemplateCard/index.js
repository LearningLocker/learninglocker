import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Card = styled.div`
  display: flex;
  align-content: center;
  flex-direction: column;
  width: 180px;
  padding: 8px;

  &:hover {
    text-decoration: none;
    cursor: pointer;
  }

  &:active {
    text-decoration: none;
  }

  img {
    height: 100px;
  }

  p {
    text-align: center;
  }
`;

/**
 * @param {string} props.title
 * @param {image file} props.srcImage
 * @param {() => void} props.onClick
 */
const TemplateCard = ({
  title,
  srcImage,
  onClick,
}) => (
  <Card onClick={onClick} >
    <img
      src={srcImage}
      alt={title} />
    <p>{title}</p>
  </Card>
);

TemplateCard.propTypes = {
  title: PropTypes.string.isRequired,
  srcImage: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default React.memo(TemplateCard);
