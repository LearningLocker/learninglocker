import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import * as personasImportHelpers from 'lib/services/importPersonas/personasImportHelpers';
import { updateModel } from 'ui/redux/modules/models';
import FieldTypeForm from './FieldTypeForm';
import PrimaryForm from './PrimaryForm';
import RelatedColumnForm from './RelatedColumnForm';
import styles from './styles.css';

const handlers = {
  onColumnTypeChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    const resetStructure = personasImportHelpers.resetRelatedStructure({
      structure: model.get('structure', new Map()),
      columnName,
    });

    const newStructure = resetStructure.setIn([columnName, 'columnType'], event.target.value);

    const isOrderable = personasImportHelpers.isColumnOrderable({
      columnStructure: newStructure.get(columnName).toJS()
    });

    const newPrimary = isOrderable
      ? personasImportHelpers.getPrimaryMaxPlusOne({ structure: newStructure })
      : null;

    const newStructureOrder = newStructure.setIn([columnName, 'primary'], newPrimary);

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructureOrder
    });
  },

  onPrimaryOrderChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: ['structure', columnName, 'primary'],
      value: parseInt(event.target.value)
    });
  },

  onRelatedColumnChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    const newStructure = personasImportHelpers.updateRelatedStructure({
      structure: model.get('structure'),
      columnName,
      relatedColumn: event.target.value
    });

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructure
    });
  },
};

const InputFields = ({
  columnStructure,
  model,
  disabled,
  onColumnTypeChange,
  onPrimaryOrderChange,
  onRelatedColumnChange,
}) => {
  const isColumnOrderable = personasImportHelpers.isColumnOrderable({ columnStructure: columnStructure.toJS() });
  const hasRelatedField = personasImportHelpers.hasRelatedField(columnStructure.get('columnType'));

  return (
    <td className={`${styles.td} ${styles.inputFields}`}>
      <FieldTypeForm
        columnType={columnStructure.get('columnType', '')}
        onChange={onColumnTypeChange}
        disabled={disabled} />

      {isColumnOrderable && (
        <PrimaryForm
          primary={columnStructure.get('primary')}
          onChange={onPrimaryOrderChange}
          disabled={disabled} />
      )}

      {hasRelatedField && (
        <RelatedColumnForm
          relatedColumn={columnStructure.get('relatedColumn')}
          onChange={onRelatedColumnChange}
          disabled={disabled}
          columnType={columnStructure.get('columnType', '')}
          structure={model.get('structure', new Map())} />
      )}
    </td>
  );
};

export default compose(
  withStyles(styles),
  connect(
    state => state,
    { updateModel },
  ),
  withHandlers(handlers),
)(InputFields);
