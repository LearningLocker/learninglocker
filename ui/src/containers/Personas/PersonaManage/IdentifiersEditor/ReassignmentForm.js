import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { Map } from 'immutable';
import { withModel } from 'ui/utils/hocs';
import { clearModelsCache as clearCache } from 'ui/redux/actions';
import ConfirmTextIconButton from 'ui/components/TextIconButton/ConfirmTextIconButton';
import CancelTextIconButton from 'ui/components/TextIconButton/CancelTextIconButton';
import PersonaAutoComplete from '../PersonaAutoComplete';
import createPersonaIdentFilter from '../createPersonaIdentFilter';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel,
  connect(() => ({}), { clearModelsCache: clearCache })
);

const render = ({ model, getMetadata, setMetadata, saveModel, clearModelsCache }) => {
  const reassignmentTargetId = getMetadata('reassignmentTargetId');
  const currentPersonaId = model.get('persona');
  const isReassignmentDisabled = reassignmentTargetId === undefined;
  const handleCancelReassignment = () => {
    setMetadata('isReassignmentVisible', false);
    setMetadata('reassignmentTargetId', undefined);
  };
  const handleReassignment = async () => {
    handleCancelReassignment();
    await saveModel({ attrs: new Map({ persona: reassignmentTargetId }) });
    clearModelsCache({
      schema: 'personaIdentifier',
      filter: createPersonaIdentFilter(reassignmentTargetId),
    });
    clearModelsCache({
      schema: 'personaIdentifier',
      filter: createPersonaIdentFilter(currentPersonaId),
    });
  };
  const handleReassignmentTargetChange = (persona) => {
    setMetadata('reassignmentTargetId', persona.get('_id'));
  };
  return (
    <div>
      <div className="form-group">
        <PersonaAutoComplete
          selectedPersonaId={reassignmentTargetId}
          currentPersonaId={currentPersonaId}
          onChange={handleReassignmentTargetChange} />
      </div>
      <div>
        <ConfirmTextIconButton
          text="Reassign"
          disabled={isReassignmentDisabled}
          onClick={handleReassignment} />
        <CancelTextIconButton onClick={handleCancelReassignment} />
      </div>
    </div>
  );
};

export default enhance(render);
