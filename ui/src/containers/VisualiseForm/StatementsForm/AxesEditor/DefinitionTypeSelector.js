import React from 'react';
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

  return (
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix">
        Content Activities Definition Type
      </label>

      <Dropdown
        auto
        onChange={(value) => {
          const updatedGroup = group.set('contextActivityDefinitionType', value);
          onChangeGroup(updatedGroup);
        }}
        source={[defaultOption].concat(
          queryBuilderCacheValueModels
          .filter(c => c.get('path', '') === `${searchPath}.definition.type`)
          .map(c => ({
            value: c.get('value'),
            label: c.get('value'),
          }))
          .toList()
          .toJS()
        )}
        value={group.get('contextActivityDefinitionType', null)} />
    </div>
  );
};

export default DefinitionTypeSelector;
