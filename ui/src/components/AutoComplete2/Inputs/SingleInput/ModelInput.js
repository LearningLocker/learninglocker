import React from 'react';
import { mapValues } from 'lodash';
import { fromJS } from 'immutable';
import { compose, withProps, defaultProps, withState } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import SingleInput from 'ui/components/AutoComplete2/Inputs/SingleInput/SingleInput';
import EditableOption from 'ui/components/AutoComplete2/Option/EditableOption';

const EditableOptionWithToggle = withState('isEditing', 'setIsEditing')(EditableOption);

const defaultSearchStringToFilter = (searchString) => {
  switch (searchString) {
    case '': return new Map();
    default: return fromJS({ searchString: { $regex: searchString, $options: 'i' } });
  }
};

const withSearchStringToFilter = defaultProps({
  searchStringToFilter: defaultSearchStringToFilter
});

const withModelInputProps = withProps(({
  model,
  onChangeFilter,
  updateModel,
  deleteModel,
  parseOption,
  parseOptionTooltip,
  searchStringToFilter,
  deselectOption,
  fields,
  defaultValues
}) => ({
  onChangeSearchString: (e) => {
    const searchString = e.target.value;
    const filter = searchStringToFilter(searchString);
    onChangeFilter(filter);
  },
  selectedOption: model.isEmpty() ? null : model,
  renderOption: ({ option }) => (
    <EditableOptionWithToggle
      fields={fields}
      defaultValues={defaultValues}
      parseOption={parseOption}
      parseOptionTooltip={parseOptionTooltip}
      option={option}
      onSubmit={payload =>
        mapValues(payload, (value, key) => {
          updateModel({ path: [key], value });
        })
      }
      onDelete={() => {
        deselectOption();
        deleteModel();
      }} />
  )
}));


export default compose(
  withModel,
  withSearchStringToFilter,
  withModelInputProps
)(SingleInput);
