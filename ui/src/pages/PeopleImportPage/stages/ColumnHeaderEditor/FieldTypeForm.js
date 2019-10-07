import React from 'react';
import uuid from 'uuid';
import {
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  COLUMN_ACCOUNT_KEY
} from 'lib/constants/personasImport';
import { InputField } from './InputField';

const FieldTypeForm = ({
  columnType,
  onChange,
  disabled,
}) => {
  const formId = uuid.v4();
  return (
    <InputField className="form-group">
      <label htmlFor={formId}>
        Field type
      </label>

      <select
        id={formId}
        className="form-control"
        onChange={onChange}
        value={columnType}
        disabled={disabled}>

        <option key="" value="">
          Nothing
        </option>

        {
          COLUMN_TYPES
            .filter(type => type !== COLUMN_ACCOUNT_KEY || columnType === COLUMN_ACCOUNT_KEY)
            .map(type => (
              <option key={type} value={type}>
                {COLUMN_TYPE_LABELS[type]}
              </option>
            ))
        }
      </select>
    </InputField>
  );
};

export default FieldTypeForm;
