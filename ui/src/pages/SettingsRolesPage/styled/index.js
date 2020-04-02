import styled from 'styled-components';

import LLCheckbox from 'ui/components/Material/Checkbox';

export const Table = styled.table`
  width: 100%;
  color: black;
  font-weight: bold;

  tbody tr:nth-child(even) {
    background-color: #FAFAFA;
  }

  td {
    padding-bottom: 8px;
    padding-top: 8px;
  }
`;

export const Checkbox = styled(LLCheckbox)`
  & {
    margin-top: 0;
    margin-bottom: 0 !important;
  }
`;
