import React from 'react';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styles from './styles.css';

/**
 * @param {string} _.relatedColumn
 */
const AccountNameForm = ({
  relatedColumn,
}) => (
  <div className={`form-group ${styles.inputField}`}>
    <label>
      Account name column
    </label>

    <select
      className="form-control"
      value={relatedColumn}
      disabled>
      <option key={relatedColumn} value={relatedColumn}>
        {relatedColumn}
      </option>
    </select>
  </div>
);

export default compose(
  withStyles(styles)
)(AccountNameForm);
