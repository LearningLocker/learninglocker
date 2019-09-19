import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { mergePersona as merge } from 'ui/redux/modules/people';
import TextIconButton from 'ui/components/TextIconButton/TextIconButton';

const enhance = compose(
  connect(() => ({}), { mergePersona: merge }),
  withProps({ schema: 'persona' }),
  withModel,
  withHandlers({
    handleMerge: ({
      id,
      mergePersona,
      getMetadata,
      setMetadata,
      deleteMetadata
    }) => () => {
      const mergePersonaFromId = getMetadata('mergeTargetId');
      const mergePersonaToId = id;
      setMetadata('isMergeFormVisible', false);
      deleteMetadata('mergeTargetId');
      mergePersona(mergePersonaFromId, mergePersonaToId);
    }
  })
);

const render = ({ handleMerge, disabled }) => (
  <TextIconButton
    text="Merge Persona"
    icon="ion ion-merge"
    onClick={handleMerge}
    disabled={disabled} />
);

export default enhance(render);
