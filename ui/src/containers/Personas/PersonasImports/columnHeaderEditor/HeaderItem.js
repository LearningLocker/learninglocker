import React from 'react';
import {
  compose,
  withHandlers,
} from 'recompose';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { updateModel } from 'ui/redux/modules/models';
import {
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  COLUMN_ACCOUNT_KEY,
  COLUMN_ACCOUNT_VALUE
} from 'lib/constants/personasImport';
import { map } from 'lodash';
import {
  hasRelatedField,
  updateRelatedStructure,
  resetRelatedStructure,
  isColumnOrderable,
  getPrimaryMaxPlusOne,
  getPossibleRelatedAndNothingColumns
} from 'lib/services/importPersonas/personasImportHelpers';
import Switch from 'ui/components/Material/Switch';

const schema = 'personasImport';

const headerItemHandlers = withHandlers({
  onColumnTypeChange: ({
    columnName,
    model,
    updateModel: doUpdateModel,
  }) => (event) => {
    const value = event.target.value;

    const resetStructure = resetRelatedStructure({
      structure: model.get('structure', fromJS({})),
      columnName
    });

    let newStructure =
      resetStructure.setIn([columnName, 'columnType'], value);

    if (value === COLUMN_ACCOUNT_VALUE) {
      newStructure = newStructure.setIn([columnName, 'useConstant'], true);
    }
    const isOrderable = isColumnOrderable({ columnStructure: newStructure.get(columnName).toJS() });
    const newStructureOrder = isOrderable ?
      newStructure.setIn(
        [columnName, 'primary'],
        getPrimaryMaxPlusOne({ structure: newStructure })
      ) :
      newStructure.setIn([columnName, 'primary'], null);

    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: 'structure',
      value: newStructureOrder
    });
  },
  onPrimaryChange: ({
    columnName,
    model,
    updateModel: doUpdateModel
  }) => (value) => {
    if (!value) {
      doUpdateModel({
        schema,
        id: model.get('_id'),
        path: ['structure', columnName, 'primary'],
        value: null
      });
      return;
    }

    const maxOrder = model.get('structure')
        .map(s => s.primary)
        .reduce((acc, number) => (number > acc ? number : acc), 0);
    const newOrder = maxOrder + 1;

    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: ['structure', columnName, 'primary'],
      value: newOrder
    });
  },
  onPrimaryOrderChange: ({
    columnName,
    model,
    updateModel: doUpdateModel
  }) => (event) => {
    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: ['structure', columnName, 'primary'],
      value: parseInt(event.target.value)
    });
  },
  onRelatedColumnChange: ({
    columnName,
    model,
    updateModel: doUpdateModel
  }) => (event) => {
    const newStructure = updateRelatedStructure({
      structure: model.get('structure'),
      columnName,
      relatedColumn: event.target.value
    });

    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: 'structure',
      value: newStructure
    });
  },
  onUseConstantChange: ({
    columnName,
    model,
    updateModel: doUpdateModel
  }) => inverse => (event) => {
    let newStructure = model
      .get('structure')
      .setIn([columnName, 'useConstant'], inverse ? !event : event);
    if (newStructure.getIn([columnName, 'useConstant']) === true) {
      // deselect any related columns
      newStructure = updateRelatedStructure({
        structure: newStructure,
        columnName,
        relatedColumn: false
      });
    }

    newStructure = newStructure.setIn(
      [columnName, 'primary'],
      getPrimaryMaxPlusOne({ structure: newStructure })
    );

    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: 'structure',
      value: newStructure
    });
  },
  onConstantChange: ({
    columnName,
    model,
    updateModel: doUpdateModel
  }) => (event) => {
    doUpdateModel({
      schema,
      id: model.get('_id'),
      path: ['structure'],
      value: model.get('structure').setIn([columnName, 'constant'], event.target.value)
    });
  }
});

export const HeaderItemComponent = ({
  columnName,
  columnStructure,
  onColumnTypeChange,
  onPrimaryOrderChange,
  onRelatedColumnChange,
  onUseConstantChange,
  onConstantChange,
  model,
  disabled
}) => {
  const columnType = columnStructure.get('columnType');

  const disabledAccountKey = columnTyp => columnTyp === COLUMN_ACCOUNT_KEY;

  return (
    <div>
      <h3>{columnName}</h3>

      {isColumnOrderable({
        columnStructure: columnStructure.toJS()
      }) && <div className="form-group">
        <label htmlFor={`${model.get('_id')}-${columnName}-order`}>Order</label>
        <input
          className="form-control"
          id={`${model.get('_id')}-${columnName}-order`}
          onChange={onPrimaryOrderChange}
          value={columnStructure.get('primary')}
          type="number"
          disabled={disabled} />
      </div>
      }

      <div className="form-group">
        <label htmlFor={`${model.get('_id')}-${columnName}-columnType`}>Field type</label>
        <select
          id={`${model.get('_id')}-${columnName}-columnType`}
          className="form-control"
          onChange={onColumnTypeChange}
          value={columnStructure.get('columnType', '')}
          disabled={disabled} >
          <option key="" value="">Nothing</option>
          {
            COLUMN_TYPES
              .filter(type => type !== COLUMN_ACCOUNT_KEY || columnType === COLUMN_ACCOUNT_KEY)
              .map(type => (
                <option key={type} value={type}>{COLUMN_TYPE_LABELS[type]}</option>
              ))
          }
        </select>
      </div>

      {hasRelatedField(columnType) &&
        <div className="form-group">
          <label htmlFor={`${model.get('_id')}-${columnName}-relatedColumn`}>
            {(columnType === COLUMN_ACCOUNT_KEY
              ? 'Account name column'
              : 'Account home page'
            )}
          </label>

          {(columnType === COLUMN_ACCOUNT_VALUE) &&
            <div>
              <Switch
                label="Select column"
                checked={!columnStructure.get('useConstant', true)}
                onChange={onUseConstantChange(true)}
                disabled={disabled}
              />
              <Switch
                label="Set value"
                checked={columnStructure.get('useConstant', true)}
                onChange={(onUseConstantChange(false))}
                disabled={disabled}
              />
            </div>
          }
          {!columnStructure.get('useConstant') && <select
            id={`${model.get('_id')}-${columnName}-relatedColumn`}
            className="form-control"
            onChange={onRelatedColumnChange}
            value={columnStructure.get('relatedColumn', '')}
            disabled={disabled || disabledAccountKey(columnType)} >

            <option disabled />
            {
              map(
                getPossibleRelatedAndNothingColumns({
                  columnType: columnStructure.get('columnType'),
                  structure: model.get('structure').toJS(),
                }),
                relatedColumn =>
                  (<option key={relatedColumn} value={relatedColumn}>{relatedColumn}</option>)
              )
            }
          </select>}
          {columnStructure.get('useConstant') &&
            <input
              id={`${model.get('_id')}-${columnName}-relatedColumnConstant`}
              type="text"
              className="form-control"
              onChange={onConstantChange}
              value={columnStructure.get('constant', '')}
              disabled={disabled} />
          }
        </div>
      }
    </div>
  );
};

export default compose(
  connect(
    state => state,
    { updateModel }
  ),
  headerItemHandlers
)(HeaderItemComponent);
