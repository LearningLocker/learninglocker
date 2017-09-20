import React from 'react';
import OptionListItem from 'ui/components/OptionListItem';
import TextInputGroup from 'ui/components/TextInputGroup';
import { withState, withProps, compose, withHandlers } from 'recompose';
import { connect } from 'react-redux';
import { loggedInUserId } from 'ui/redux/selectors';

const withLoggedInUserId = connect(state => ({
  userId: loggedInUserId(state)
}));

const withIsEditing = compose(
  withState('isEditing', 'setIsEditing'),
  withProps(({ setIsEditing }) => ({
    setIsEditingTrue: (value, e) => {
      if (e) e.stopPropagation();
      setIsEditing(true);
    },
    setIsEditingFalse: (value, e) => {
      if (e) e.stopPropagation();
      setIsEditing(false);
    }
  }))
);

const withEventHandlers = withHandlers({
  onSubmit: ({
    addModel,
    onAddNew = () => {},
    setIsEditingFalse,
    userId,
    defaultNewValues
  }) => async (payload) => {
    setIsEditingFalse();
    payload.owner = userId;
    const props = { ...defaultNewValues, ...payload };
    const { model } = await addModel({ props });
    return onAddNew(model);
  },
  onCancel: ({
    setIsEditingFalse,
  }) => () => {
    setIsEditingFalse();
  }
});

export default compose(
  withLoggedInUserId,
  withIsEditing,
  withEventHandlers,
)(({
  isEditing,
  setIsEditingTrue,
  onSubmit,
  onCancel,
  fields = ['name'],
  defaultValues = []
}) => {
  if (isEditing) {
    return (
      <TextInputGroup
        onSubmit={onSubmit}
        onCancel={onCancel}
        fields={fields}
        defaultValues={defaultValues} />
    );
  }
  return <OptionListItem label="Add new" onClick={setIsEditingTrue} />;
});
