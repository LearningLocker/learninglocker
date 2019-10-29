import React from 'react';
import DebounceInput from 'react-debounce-input';
import uuid from 'uuid';
import { InputField } from './InputField';

const AttributeNameForm = ({
  attributeName,
  disabled,
  onChange,
}) => {
  const formId = uuid.v4();

  return (
    <InputField className="form-group">
      <label htmlFor={formId}>
        Attribute Name
      </label>

      <form id={formId}>
        <DebounceInput
          className="form-control"
          debounceTimeout={377}
          value={attributeName}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Attribute Name" />
      </form>
    </InputField>
  );
};

export default AttributeNameForm;
