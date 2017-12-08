import React from 'react';
import { fromJS, Map } from 'immutable';
import { compose, withProps } from 'recompose';
import classNames from 'classnames';
import { withModel } from 'ui/utils/hocs';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import IdentifiersViewer from '../IdentifiersViewer';
import AttributesViewer from '../AttributesViewer';
import MergeButton from './MergeButton';
import styles from './styles.css';

const searchStringToFilter = (searchString) => {
  switch (searchString) {
    case '':
      return new Map();
    default:
      return fromJS({ name: { $regex: searchString, $options: 'i' } });
  }
};

const sort = new Map({ name: 1, _id: 1 });

const enhance = compose(
  withProps({ schema: 'persona' }),
  withModel,
  withStyles(styles)
);

const renderTarget = ({ hasTarget, mergeTargetId }) => {
  if (!hasTarget) {
    return <noscript />
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
  )
};

const render = ({ id, hasMetadata, getMetadata, setMetadata }) => {
  const hasTarget = hasMetadata('mergeTargetId');
  const mergeTargetId = getMetadata('mergeTargetId');
  const handleMergeTargetChange = (persona) => {
    setMetadata('mergeTargetId', persona.get('_id'));
  };

  return (
    <div>
      <div className={classNames("form-group", styles.section)}>
        <label className="control-label">
          Merge identifiers and attributes from
        </label>
        <ModelAutoComplete
          filter={fromJS({
            _id: { $ne: { $oid: id } }
          })}
          sort={sort}
          schema="persona"
          searchStringToFilter={searchStringToFilter}
          id={mergeTargetId}
          parseOption={model => model.get('name')}
          parseOptionTooltip={model => model.get('name')}
          onChange={handleMergeTargetChange} />
        <div className={styles.section}>
          <MergeButton id={id} disabled={!hasTarget} />
        </div>
      </div>
      {renderTarget({ hasTarget, mergeTargetId })}
    </div>
  );
};

export default enhance(render);
