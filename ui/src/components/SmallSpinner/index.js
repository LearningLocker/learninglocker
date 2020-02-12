import React from 'react';
import styled from 'styled-components';

import { rotation } from 'ui/utils/styled/animations';

const SmallSpinner = styled.div`
  height: 1.5em;
  width: 1.5em;
  margin: auto;
  animation: ${rotation} .6s infinite linear;
  border-left: 4px solid rgba(245, 170, 53, 0.15);
  border-right: 4px solid rgba(245, 170, 53, 0.15);
  border-bottom: 4px solid rgba(245, 170, 53, 0.15);
  border-top: 4px solid rgba(245, 170, 53, 0.8);
  border-radius: 100%;
`;

const smallSpinner = () => (<SmallSpinner />);

export default smallSpinner;
