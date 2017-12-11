import React, { PropTypes } from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import ConfirmTextIconButton from 'ui/components/TextIconButton/ConfirmTextIconButton';
import CancelTextIconButton from 'ui/components/TextIconButton/CancelTextIconButton';
import PersonaAutoComplete from '../PersonaAutoComplete';

const enhance = compose(
  withProps({ schema: 'personaIdentifier' }),
  withModel
);

const render = ({ id, model, getMetadata, setMetadata, updateModel }) => {
  const reassignmentTargetId = getMetadata('reassignmentTargetId');
  const currentPersonaId = model.get('persona');
  const isReassignmentDisabled = reassignmentTargetId === undefined;
  const handleCancelReassignment = () => {
    setMetadata('isReassignmentVisible', false);
    setMetadata('reassignmentTargetId', undefined);
  };
  const handleReassignment = () => {
    updateModel({ path: ['persona'], value: reassignmentTargetId });
    handleCancelReassignment();
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