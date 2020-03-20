import styled from 'styled-components';

export const Panel = styled.div`
  padding: 16px;
`;

export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
`;

export const Card = styled.div`
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
    display: block;
    margin-left: auto;
    margin-right: auto;
    height: 120px;
    width: 120px
  }

  p {
    text-align: center;
  }
`;
