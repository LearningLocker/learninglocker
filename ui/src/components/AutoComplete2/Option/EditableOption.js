import React from 'react';
import OptionListItem from 'ui/components/OptionListItem';
import TextInputGroup from 'ui/components/TextInputGroup';

const EditableOption = ({
  option,
  isEditing,
  setIsEditing,
  onSubmit,
  onDelete,
  onClick,
  parseOption,
  parseOptionTooltip,
  fields = ['name'],
  defaultValues = fields.map(field => option.get(field)),
  canEdit = () => true
}) => {
  if (isEditing) {
    return (
      <TextInputGroup
        onSubmit={(payload) => {
          onSubmit(payload);
          setIsEditing(false);
        }}
        onCancel={() => {
          setIsEditing(false);
        }}
        fields={fields}
        defaultValues={defaultValues} />
    );
  }

  return (
    <OptionListItem
      label={parseOption(option)}
      tooltip={parseOptionTooltip(option)}
      data={option}
      onClick={onClick}
      onEdit={(() => canEdit(option)) && (() => {
        setIsEditing(true);
      })}
      onDelete={(() => canEdit(option)) && onDelete} />
  );
};

export default EditableOption;
