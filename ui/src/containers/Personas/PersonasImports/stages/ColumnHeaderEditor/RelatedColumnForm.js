import React from 'react';
import uuid from 'uuid';
import { compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { COLUMN_ACCOUNT_KEY } from 'lib/constants/personasImport';
import { getPossibleRelatedColumns } from 'lib/services/importPersonas/personasImportHelpers';
import styles from './styles.css';

const RelatedColumnForm = ({
  relatedColumn,
  onChange,
  disabled,
  columnType,
  structure,
}) => {
  const formId = uuid.v4();
  const labelValue = columnType === COLUMN_ACCOUNT_KEY
    ? 'Account name column'
    : 'Account home page column';

  const options = getPossibleRelatedColumns({
    columnType,
    structure: structure.toJS(),
  }).map(column => (
    <option key={column} value={column}>
      {column}
    </option>
  ));

  return (
    <div className={`form-group ${styles.inputField}`}>
      <label htmlFor={formId}>
        {labelValue}
      </label>

      <select
        id={formId}
        className="form-control"
        onChange={onChange}
        value={relatedColumn}
        disabled={disabled}>

        <option disabled />
        {options}
      </select>
    </div>
  );
};

export default compose(
  withStyles(styles)
)(RelatedColumnForm);
