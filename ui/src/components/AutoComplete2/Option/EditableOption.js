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

  const canEditOption = canEdit(option);
  const canEditHandler = canEditOption ? () => { setIsEditing(true); } : () => {};
  const canDeleteHandler = canEditOption ? onDelete : () => {};

  return (
    <OptionListItem
      label={parseOption(option)}
      tooltip={parseOptionTooltip(option)}
      data={option}
      onClick={onClick}
      onEdit={canEditHandler}
      onDelete={canDeleteHandler} />
  );
};

export default EditableOption;
