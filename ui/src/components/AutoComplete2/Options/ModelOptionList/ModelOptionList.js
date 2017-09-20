import React from 'react';
import { Map } from 'immutable';
import { compose, withProps, withState } from 'recompose';
import { mapValues } from 'lodash';
import { withModels, withModelCount } from 'ui/utils/hocs';
import EditableOption from 'ui/components/AutoComplete2/Option/EditableOption';
import OptionListItem from 'ui/components/OptionListItem';
import AddNewOption from 'ui/components/AutoComplete2/Option/AddNewOption';
import OptionList from 'ui/components/AutoComplete2/Options/OptionList/OptionList';

const renderOption = ({
  updateModel,
  deleteModel,
  parseOption,
  parseOptionTooltip,
  isEditing,
  canEdit,
  setIsEditing
}) => ({
  option = new Map(),
  onSelectOption,
  deselectOption,
  resetRow,
  index,
  fields,
  defaultValues
}) => {
  const isEditable = canEdit(option);
  if (isEditable) {
    return (
      <EditableOption
        fields={fields}
        defaultValues={defaultValues}
        option={option}
        isEditing={isEditing.get(index)}
        setIsEditing={(value) => {
          setIsEditing(index, value);
          resetRow(index, !value);
        }}
        onClick={onSelectOption}
        parseOption={parseOption}
        parseOptionTooltip={parseOptionTooltip}
        onSubmit={(payload) => {
          mapValues(payload, (value, key) => {
            updateModel({ id: option.get('_id'), path: [key], value });
          });
        }}
        onDelete={() => {
          deselectOption();
          deleteModel({ id: option.get('_id') });
        }} />
    );
  }
  return (
    <OptionListItem
      data={option}
      label={parseOption(option)}
      tooltip={parseOptionTooltip(option)}
      onClick={onSelectOption} />
  );
};

const withEditingState = compose(
  withState('isEditing', 'updateIsEditing', new Map()),
  withProps(({ updateIsEditing, isEditing }) => ({
    setIsEditing: (index, value) => {
      updateIsEditing(isEditing.set(index, value));
    }
  }))
);

const addProps = compose(
  withModels,
  withModelCount,
  withProps(({
    models,
    modelCount,
    updateModel,
    addModel,
    parseOption,
    parseOptionTooltip,
    deleteModel,
    isEditing,
    setIsEditing,
    canEdit = () => true,
    fields,
    defaultValues,
    defaultNewValues,
    onSelectOption
  }) => ({
    options: models.entrySeq().toList(),
    optionCount: modelCount,
    renderOption: renderOption({
      canEdit,
      updateModel,
      deleteModel,
      parseOption,
      parseOptionTooltip,
      isEditing,
      setIsEditing,
      fields,
      defaultValues
    }),
    children: (
      <AddNewOption
        fields={fields}
        defaultNewValues={defaultNewValues}
        onAddNew={onSelectOption}
        addModel={addModel} />
    )
  }))
);

export default compose(
  withEditingState,
  addProps,
)(OptionList);
