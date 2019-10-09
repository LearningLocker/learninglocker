import React from 'react';
import { compose, withProps } from 'recompose';
import classNames from 'classnames';
import { withModel } from 'ui/utils/hocs';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import IdentifiersViewer from '../IdentifiersViewer';
import AttributesViewer from '../AttributesViewer';
import PersonaAutoComplete from '../PersonaAutoComplete';
import MergeButton from './MergeButton';
import styles from './styles.css';

const enhance = compose(
  withProps({ schema: 'persona' }),
  withModel,
  withStyles(styles)
);

const renderTarget = ({ hasTarget, mergeTargetId }) => {
  if (!hasTarget) {
    return <noscript />;
  }

  return (
    <div>
      <div className={styles.section}>
        <h4>Identifiers</h4>
        <IdentifiersViewer personaId={mergeTargetId} />
      </div>
      <div className={styles.section}>
        <h4>Attributes</h4>
        <AttributesViewer personaId={mergeTargetId} />
      </div>
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
      <div className={classNames('form-group', styles.section)}>
        <div className={styles.label}>
          Merge identifiers and attributes from
        </div>
        <PersonaAutoComplete
          selectedPersonaId={mergeTargetId}
          currentPersonaId={id}
          onChange={handleMergeTargetChange} />
        <div className={styles.section}>
          <MergeButton id={id} disabled={!hasTarget} />
        </div>
      </div>
      {renderTarget({ hasTarget, mergeTargetId })}
    </div>
  );
};

export default enhance(MergeForm);
