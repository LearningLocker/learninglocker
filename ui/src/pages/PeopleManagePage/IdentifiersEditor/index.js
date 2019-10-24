import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import styled from 'styled-components';
import { withModels } from 'ui/utils/hocs';
import AddTextIconButton from 'ui/components/TextIconButton/AddTextIconButton';
import createPersonaIdentFilter from '../createPersonaIdentFilter';
import NewRow from './NewRow';
import SavedRow from './SavedRow';
import { actionsStyle } from './actionsStyle';
import { tableDataStyle } from './tableDataStyle';

const TableHeader = styled.th`${tableDataStyle}`;
const TableActionsHeader = styled(TableHeader)`${actionsStyle}`;

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
  withModels,
  withState('isNewIdentifierVisible', 'changeNewIdentifierVisibility', false)
);

const render = ({
  personaId,
  models,
  isNewIdentifierVisible,
  changeNewIdentifierVisibility,
  addModel,
}) => {
  const handleNewRowAdd = (key, value) => {
    const props = new Map({
      ifi: new Map({ key, value }),
      persona: personaId,
    });
    addModel({ props });
  };
  const handleNewRowCancel = () => {
    changeNewIdentifierVisibility(false);
  };
  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <AddTextIconButton
          text="Add Identifier"
          onClick={() => changeNewIdentifierVisibility(true)} />
      </div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <TableHeader>Type</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableActionsHeader>Actions</TableActionsHeader>
          </tr>
        </thead>
        <tbody>
          {!isNewIdentifierVisible ? null : (
            <NewRow onAdd={handleNewRowAdd} onCancel={handleNewRowCancel} />
          )}
          {models.map(model => (
            <SavedRow
              id={model.get('_id')}
              key={model.get('_id')} />
          )).valueSeq()}
        </tbody>
      </table>
    </div>
  );
};

export default enhance(render);
