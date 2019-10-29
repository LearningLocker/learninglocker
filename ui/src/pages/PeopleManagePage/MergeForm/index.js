import React from 'react';
import { compose, withProps } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import styled from 'styled-components';
import IdentifiersViewer from '../IdentifiersViewer';
import AttributesViewer from '../AttributesViewer';
import PersonaAutoComplete from '../PersonaAutoComplete';
import MergeButton from './MergeButton';

const Section = styled.div`
  margin-top: 15px;
`;

const enhance = compose(
  withProps({ schema: 'persona' }),
  withModel
);

const renderTarget = ({ hasTarget, mergeTargetId }) => {
  if (!hasTarget) {
    return <noscript />;
  }

  return (
    <div>
      <Section>
        <h4>Identifiers</h4>
        <IdentifiersViewer personaId={mergeTargetId} />
      </Section>
      <Section>
        <h4>Attributes</h4>
        <AttributesViewer personaId={mergeTargetId} />
      </Section>
    </div>
  );
};

const MergeForm = ({ id, hasMetadata, getMetadata, setMetadata }) => {
  const hasTarget = hasMetadata('mergeTargetId');
  const mergeTargetId = getMetadata('mergeTargetId');
  const handleMergeTargetChange = (persona) => {
    setMetadata('mergeTargetId', persona.get('_id'));
  };

  return (
    <div>
      <Section className="form-group">
        <div style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Merge identifiers and attributes from
        </div>
        <PersonaAutoComplete
          selectedPersonaId={mergeTargetId}
          currentPersonaId={id}
          onChange={handleMergeTargetChange} />
        <Section>
          <MergeButton id={id} disabled={!hasTarget} />
        </Section>
      </Section>
      {renderTarget({ hasTarget, mergeTargetId })}
    </div>
  );
};

export default enhance(MergeForm);
