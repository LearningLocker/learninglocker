import React from 'react';
import {
  compose,
  withHandlers,
  setPropTypes
} from 'recompose';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import { updateModel } from 'ui/redux/modules/models';
import { COLUMN_TYPES } from 'lib/constants/personasImport';
import { map } from 'lodash';
import {
  hasRelatedField,
  getPossibleRelatedColumns,
  updateRelatedStructure,
  resetRelatedStructure,
  isColumnOrderable,
  getPrimaryMaxPlusOne
} from 'lib/helpers/personasImport';

const schema = 'personasImport';

const headerItemHandlers = withHandlers({
  onColumnTypeChange: ({
    columnName,
    model,
    updateModel: doUpdateModel,
    // columnStructure,
  }) => (event) => {
    const value = event.target.value;

    const resetStructure = resetRelatedStructure({
      structure: model.get('structure', fromJS({})),
      columnName
    });

    const newStructure =
      resetStructure.setIn([columnName, 'columnType'], value);

    const newStructureOrder = (isColumnOrderable({ columnStructure: newStructure.get(columnName).toJS() })) ?
      newStructure.setIn([columnName, 'primary'], getPrimaryMaxPlusOne({ structure: newStructure }))
    :
      newStructure.deleteIn([columnName, 'primary']);

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
  }
});

const renderHeaderItem = ({
  columnName,
  columnStructure,
  onColumnTypeChange,
  onPrimaryOrderChange,
  onRelatedColumnChange,
  model
}) =>
  (
    <div>
      <h3>{columnName}</h3>

      { isColumnOrderable({ columnStructure: columnStructure.toJS() }) && <div className="form-group">
        <label htmlFor={`${model.get('_id')}-${columnName}-order`}>Order</label>
        <input
          className="form-control"
          id={`${model.get('_id')}-${columnName}-order`}
          onChange={onPrimaryOrderChange}
          value={columnStructure.get('primary')}
          type="number" />
      </div>
    }

      <div className="form-group">
        <label htmlFor={`${model.get('_id')}-${columnName}-columnType`}>Field type</label>
        <select
          id={`${model.get('_id')}-${columnName}-columnType`}
          className="form-control"
          onChange={onColumnTypeChange}
          value={columnStructure.get('columnType', '')} >
          <option key="" value="">NOTHING</option>
          {
            COLUMN_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))
          }
        </select>
      </div>

      {hasRelatedField(columnStructure.get('columnType')) &&
        <div className="form-group">
          <label htmlFor={`${model.get('_id')}-${columnName}-relatedColumn`}>Related column</label>
          <select
            id={`${model.get('_id')}-${columnName}-relatedColumn`}
            className="form-control"
            onChange={onRelatedColumnChange}
            value={columnStructure.get('relatedColumn', '')}>

            <option disabled />
            {
              map(
                getPossibleRelatedColumns({
                  columnType: columnStructure.get('columnType'),
                  structure: model.get('structure').toJS(),
                }),
                relatedColumn =>
                  (<option key={relatedColumn} value={relatedColumn}>{relatedColumn}</option>)
              )
            }
          </select>
        </div>
      }
    </div>
  );

export default compose(
  setPropTypes({
    columnName: String,
    columnStructure: Object,
    model: Object
  }),
  connect(
    state => state,
    { updateModel }
  ),
  headerItemHandlers
)(renderHeaderItem);
