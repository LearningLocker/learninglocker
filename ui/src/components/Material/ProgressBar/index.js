import React from 'react';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import styled from 'styled-components';

const valueClassName = 'value';

const StyledProgressBar = styled(ProgressBar)`
  && {
    .${valueClassName} {
      background-color: rgb(245,171,53);
    }
  }
`;

export default props => (
  <StyledProgressBar
    theme={{ value: valueClassName }}
    {...props} />
);
