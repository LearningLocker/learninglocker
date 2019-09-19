import React from 'react';
import uuid from 'uuid';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

const PrimaryForm = ({
  primary,
  onChange,
  disabled,
}) => {
  const formId = uuid.v4();
  return (
    <div className={`form-group ${styles.inputField}`}>
      <label htmlFor={formId}>
        Order
      </label>

      <input
        id={formId}
        className="form-control"
        onChange={onChange}
        value={primary}
        type="number"
        disabled={disabled} />
    </div>
  );
};

export default compose(
  withStyles(styles)
)(PrimaryForm);
