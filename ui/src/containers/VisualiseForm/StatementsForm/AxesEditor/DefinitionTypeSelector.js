import React from 'react';
import { withProps, compose } from 'recompose';
import { Map, fromJS } from 'immutable';
import { withModels } from 'ui/utils/hocs';
import { isContextActivity } from 'ui/utils/visualisations';
import Dropdown from 'ui/components/Material/Dropdown';

const DefinitionTypeSelector = ({
  visualisationModel,
  queryBuilderCacheValueModels,
  group,
  onChangeGroup,
}) => {
  const searchPath = visualisationModel.getIn(['axesgroup', 'searchString'], '');

  if (!isContextActivity(searchPath) || !group) {
    return null;
  }

  const defaultOption = {
    value: null,
    label: 'All Definition Types'
  };

  const options = queryBuilderCacheValueModels
    .filter(c => c.get('path', '') === `${searchPath}.definition.type`)
    .map(c => ({
      value: c.get('value'),
      label: c.get('value'),
    }))
    .toList()
    .toJS();

  return (
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix">
        Context Activities Definition Type
      </label>

      <Dropdown
        auto
        onChange={(value) => {
          const updatedGroup = group.set('contextActivityDefinitionType', value);
          onChangeGroup(updatedGroup);
        }}
        source={[defaultOption].concat(options)}
        value={group.get('contextActivityDefinitionType', null)} />
    </div>
  );
};


export default compose(
  withProps(({ visualisationModel }) => ({
    schema: 'querybuildercachevalue',
    sort: fromJS({ createdAt: -1, _id: -1 }),
    first: 1000,
    filter: new Map({
      path: {
        $eq: `${visualisationModel.getIn(['axesgroup', 'searchString'], '')}.definition.type`
      }
    })
  })),
  withModels,
  withProps(({ models }) => ({
    queryBuilderCacheValueModels: models,
  }))
)(DefinitionTypeSelector);
