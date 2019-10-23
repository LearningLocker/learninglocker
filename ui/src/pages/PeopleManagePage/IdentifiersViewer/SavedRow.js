import React from 'react';
import { compose, withProps } from 'recompose';
import styled from 'styled-components';
import { withModel } from 'ui/utils/hocs';
import { identifierTypeDisplays } from '../constants';
import IfiViewer from '../IfiViewer';
import { tableDataStyle } from './tableDataStyle';

const TableData = styled.td`${tableDataStyle}`;

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel
);

const render = ({ model }) => {
  const identifierType = model.getIn(['ifi', 'key']);
  const identifierValue = model.getIn(['ifi', 'value']);
  return (
    <tr>
      <TableData>
        {identifierTypeDisplays[identifierType]}
      </TableData>
      <TableData>
        <IfiViewer identifierType={identifierType} identifierValue={identifierValue} />
      </TableData>
    </tr>
  );
};

export default enhance(render);
