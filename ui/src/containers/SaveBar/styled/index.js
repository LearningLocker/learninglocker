import styled from 'styled-components';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import { compose, withProps } from 'recompose';

// Theme variables to override react toolbox component's styling
const valueClassName = 'value';
const linearClassName = 'linear';

export const Container = styled.div`
  margin-right: -11px;
  top: 56px;
  height: 0.4rem;
  position: relative;
  z-index: 5;

  .${linearClassName} {
    background: none;
  }

  .${valueClassName} {
    height: 0.4rem;
  }
`;

const getSavingStageColor = (savingStageClassName) => {
  switch (savingStageClassName) {
    case 'failed':
      return '#ff0000';
    case 'completed':
      return '#3ecb7a';
    default:
      return 'rgb(245, 171, 53)';
  }
};

export const Label = styled.div`
  position: absolute;
  top: 0.4rem;
  height: 2rem;
  left: 0;
  right: 0;
  text-align: center;
  font-weight: bold;
  ${props => `color: ${getSavingStageColor(props.savingStageClassName)};`}
`;

export const StyledProgressBar = compose(
  withProps({
    theme: {
      linear: linearClassName,
      value: valueClassName,
    }
  })
)(
  styled(ProgressBar)`
    top: -11px;

    .${valueClassName} {
      ${props => `background-color: ${getSavingStageColor(props.savingStageClassName)};`}
    }

    .${linearClassName} {
      display: block;
    }
  `
);
