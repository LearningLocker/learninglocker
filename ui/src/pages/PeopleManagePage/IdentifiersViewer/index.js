import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps, setPropTypes } from 'recompose';
import styled from 'styled-components';
import { withModels } from 'ui/utils/hocs';
import createPersonaIdentFilter from '../createPersonaIdentFilter';
import SavedRow from './SavedRow';
import { tableDataStyle } from './tableDataStyle';

const TableHeader = styled.th`${tableDataStyle}`;

const enhance = compose(
  setPropTypes({
    personaId: PropTypes.string.isRequired,
  }),
  withProps(({ personaId }) => ({
    filter: createPersonaIdentFilter(personaId),
    schema: 'personaIdentifier',
    first: 100,
    sort: new Map({ _id: -1 }),
  })),
  withModels
);

const IdentifiersViewer = ({ models }) => {
  if (models.count() === 0) {
    return (
      <div>
        No identifiers.
      </div>
    );
  }
  return (
    <div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <TableHeader>Type</TableHeader>
            <TableHeader>Value</TableHeader>
          </tr>
        </thead>
        <tbody>
          {models.map(model => (
            <SavedRow key={model.get('_id')} id={model.get('_id')} />
          )).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhance(IdentifiersViewer);
