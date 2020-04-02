import React from 'react';
import Checkbox from 'react-toolbox/lib/checkbox';
import styled from 'styled-components';

const checkClassName = 'check';
const checkedClassName = 'checked';
const rippleClassName = 'ripple';

const LLCheckbox = styled(Checkbox)`
  && {
    .${checkClassName}.${checkedClassName},
    .${rippleClassName} {
      background-color: rgb(245,171,53);
      border-color: rgb(245,171,53);
    }
  }
`;

export default props => (
  <LLCheckbox
    theme={{
      check: checkClassName,
      checked: checkedClassName,
      ripple: rippleClassName,
    }}
    {...props} />
);
