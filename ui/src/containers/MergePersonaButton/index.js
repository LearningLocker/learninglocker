import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import { mergePersona as merge } from 'ui/redux/modules/people';

const enhance = compose(
  connect(() => ({}), { mergePersona: merge }),
  withProps({
    schema: 'persona'
  }),
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

const render = ({ handleMerge }) => (
  <button id="toggle" className="btn btn-inverse btn-sm" onClick={handleMerge}>
    <i className="ion ion-merge" /> Merge Persona
  </button>
);

export default enhance(render);
