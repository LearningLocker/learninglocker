import styled from 'styled-components';
import { tableDataStyle } from './tableDataStyle';
import { actionsStyle } from './actionsStyle';

export const TableData = styled.td`${tableDataStyle}`;
export const ActionsTableData = styled(TableData)`${actionsStyle}`;
