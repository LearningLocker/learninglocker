import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled, { css } from 'styled-components';
import { compose, withProps, setPropTypes } from 'recompose';
import { withModels } from 'ui/utils/hocs';

const tableDataStyles = css`
  padding: 8px;
  border: solid rgb(238, 238, 238) 1px;
  width: 50%;
`;

const TableData = styled.td`${tableDataStyles}`;
const TableHeader = styled.th`${tableDataStyles}`;

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: new Map({ personaId: new Map({ $oid: personaId }) }),
    schema: 'personaAttribute',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels
);

const render = ({ models }) => {
  if (models.count() === 0) {
    return (
      <div>
        No attributes.
      </div>
    );
  }
  return (
    <div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Value</TableHeader>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => {
            const key = model.get('key', '');
            const value = model.get('value', '');
            return (
              <tr key={model.get('_id')}>
                <TableData>{key}</TableData>
                <TableData>{value}</TableData>
              </tr>
            );
          }).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhance(render);
