import styled, { css } from 'styled-components';

export const actionsStyle = css`
  text-align: right;
  width: 14%;
`;

export const tableDataStyle = css`
  padding: 8px;
  border: solid rgb(238, 238, 238) 1px;
  width: 43%;
`;

export const TableHeader = styled.th`${tableDataStyle}`;
export const TableActionsHeader = styled(TableHeader)`${actionsStyle}`;

export const TableData = styled.td`${tableDataStyle}`;
export const TableActionsData = styled(TableData)`${actionsStyle}`;
