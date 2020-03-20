import React from 'react';
import uuid from 'uuid';
import { InputField } from './InputField';

/**
 * @param {string} _.relatedColumn
 */
const AccountNameForm = ({
  relatedColumn,
}) => {
  const formId = uuid.v4();
  return (
    <InputField className="form-group">
      <label htmlFor={formId} >
        Account name column
      </label>

      <select
        id={formId}
        className="form-control"
        value={relatedColumn}
        disabled>
        <option key={relatedColumn} value={relatedColumn}>
          {relatedColumn}
        </option>
      </select>
    </InputField>
  );
};

export default AccountNameForm;
