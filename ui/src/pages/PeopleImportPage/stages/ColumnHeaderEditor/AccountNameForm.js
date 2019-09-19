import React from 'react';
import uuid from 'uuid';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * @param {string} _.relatedColumn
 */
const AccountNameForm = ({
  relatedColumn,
}) => {
  const formId = uuid.v4();
  return (
    <div className={`form-group ${styles.inputField}`}>
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
    </div>
  );
};

export default compose(
  withStyles(styles)
)(AccountNameForm);
