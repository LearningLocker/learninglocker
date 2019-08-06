import React from 'react';
import DebounceInput from 'react-debounce-input';
import uuid from 'uuid';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const AttributeNameForm = ({
  attributeName,
  disabled,
  onChange,
}) => {
  const formId = uuid.v4();

  return (
    <div className={`form-group ${styles.inputField}`}>
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
    </div>
  );
};

export default compose(
  withStyles(styles)
)(AttributeNameForm);
