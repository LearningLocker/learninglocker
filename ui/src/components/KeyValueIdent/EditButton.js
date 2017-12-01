import React from 'react';

const EditButton = ({
  className,
  onEdit
}) =>
  (<button
    className={className}
    onClick={onEdit} >
    Edit
  </button>);

export default EditButton;
