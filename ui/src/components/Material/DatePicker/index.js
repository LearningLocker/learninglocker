import React from 'react';
import { DatePicker } from 'react-toolbox/lib/date_picker';
import styled from 'styled-components';

const inputClassName = 'dp-input';
const inputElementClassName = 'dp-inputElement';
const headerClassName = 'dp-header';
const activeClassName = 'dp-active';
const dayClassName = 'dp-day';
const yearsClassName = 'dp-years';

/**
 * This wrapper was created because if we use `style(DatePicker)` it puts component id and generated className
 * only on date picker dialog and NOT ON input block
 */
// Here you should put the styles related to date picker input
const DatePickerWrapper = styled.div`
  .${inputClassName} {
    padding: 0;
  }

  .${inputElementClassName} {
    padding-top: 4px;
    padding-bottom: 0;
  }
`;

// Here you should put the styles related to date picker dialog
const StyledDatePicker = styled(DatePicker)`
  .${headerClassName} {
    background: rgb(245,171,53);
  }

  .${activeClassName} {
    & > span {
      background: rgb(245,171,53) !important;
    }
  }

  .${dayClassName}:hover {
    & > span {
      background: rgb(245,171,53, 0.21) !important;
    }
  }

  .${yearsClassName} .${activeClassName} {
    color: rgb(245,171,53);
  }
`;

export default props => (
  <DatePickerWrapper>
    <StyledDatePicker
      theme={{
        input: inputClassName,
        inputElement: inputElementClassName,
        header: headerClassName,
        active: activeClassName,
        day: dayClassName,
        years: yearsClassName,
      }}
      {...props} />
  </DatePickerWrapper>
);
