import React from 'react';
import styled from 'styled-components';
import InputFields from './InputFields';
import { TableData } from './TableData';

const TableHeader = styled.th`
  background-color: #525252;
  color: #FFFFFF;
  text-align: left;
  padding: 8px;
`;

const Table = styled.table`
  tbody tr:nth-child(odd) {
    background-color: #FAFAFA;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 180px;
  }
`;

export const ColumnHeaderEditor = ({
  model, // personasImports model
  disabled
}) => (
  <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <TableHeader>CSV Column Name</TableHeader>
        <TableHeader>Persona Field</TableHeader>
      </tr>
    </thead>

    <tbody>
      {
          model
            .get('structure', new Map())
            .map((columnStructure, columnName) => (
              <tr key={columnName}>
                <TableData>{columnName}</TableData>

                <InputFields
                  columnStructure={columnStructure}
                  model={model}
                  disabled={disabled} />
              </tr>
            )).toList().toJS()
        }
    </tbody>
  </Table>
  );

export default ColumnHeaderEditor;
