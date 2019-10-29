import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps, setPropTypes, withState } from 'recompose';
import { withModels } from 'ui/utils/hocs';
import AddTextIconButton from 'ui/components/TextIconButton/AddTextIconButton';
import NewRow from './NewRow';
import SavedRow from './SavedRow';
import { TableActionsHeader, TableHeader } from './tableComponents';

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
  withModels,
  withState('isNewAttributeVisible', 'changeNewAttributeVisibility', false)
);

const render = ({
  personaId,
  models,
  isNewAttributeVisible,
  changeNewAttributeVisibility,
  addModel,
}) => {
  const handleNewRowAdd = (key, value) => {
    const props = new Map({ key, value, personaId });
    addModel({ props });
  };
  const handleNewRowCancel = () => {
    changeNewAttributeVisibility(false);
  };
  const handleShowNewRow = () => {
    changeNewAttributeVisibility(true);
  };
  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <AddTextIconButton text="Add Attribute" onClick={handleShowNewRow} />
      </div>
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <TableHeader>Name</TableHeader>
            <TableHeader>Value</TableHeader>
            <TableActionsHeader>Actions</TableActionsHeader>
          </tr>
        </thead>
        <tbody>
          {!isNewAttributeVisible ? null : (
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
