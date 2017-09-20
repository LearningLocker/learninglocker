import React from 'react';
import { fromJS, Map } from 'immutable';
import { compose, withHandlers } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import PersonaIdentifiers from 'ui/containers/PersonaIdentifiers';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import MergePersonaButton from 'ui/containers/MergePersonaButton';

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
  withModel,
  withHandlers({
    handleMergeTargetChange: ({ setMetadata }) => (persona) => {
      setMetadata('mergeTargetId', persona.get('_id'));
    }
  })
);

const render = ({ id, hasMetadata, getMetadata, handleMergeTargetChange }) => {
  const hasTarget = hasMetadata('mergeTargetId');
  const mergeTargetId = getMetadata('mergeTargetId');

  return (
    <div>
      <form>
        <div className="form-group">
          <span className="control-label">
            Merge persona identifiers from
          </span>
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
        </div>
      </form>
      {hasTarget && <MergePersonaButton id={id} />}
      {hasTarget && <PersonaIdentifiers personaId={mergeTargetId} />}
    </div>
  );
};

export default enhance(render);
