import React from 'react';
import styled from 'styled-components';

const Footer = styled.div`
  color: #999;

  @media screen and (max-height: 765px) {
    width: 150px;
  }
`;

export default () => (
  <Footer>
    <a href="https://ht2ltd.zendesk.com/hc/en-us/categories/115000129989-Learning-Locker">Help centre</a>
    <div>Powered by</div>
    <a href="http://learninglocker.net" target="_blank" rel="noopener noreferrer">Learning Locker Cloud</a>
  </Footer>
);
