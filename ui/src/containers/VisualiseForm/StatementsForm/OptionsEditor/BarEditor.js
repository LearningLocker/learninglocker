import React from 'react';
import Switch from 'ui/components/Material/Switch';
import { FIVE, TEN, FIFTEEN, TWENTY } from 'ui/utils/constants';
import { compose } from 'recompose';
import { setInMetadata } from 'ui/redux/modules/metadata';
import { connect, withHandlers } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';

const BarEditorComponent = ({ model, sourceViewHandler, barChartGroupingLimitHandler }) => (
  <div className="form-group">
    <Switch
      label="View as table"
      id={'BarEditorComponent'}
      checked={model.get('sourceView')}
      onChange={sourceViewHandler} />
    <select
      id={'barEditorComponent'}
      className={'options-menu'}
      value={model.get('barChartGroupingLimit')}
      onChange={barChartGroupingLimitHandler}>
      <option value={FIVE}>Show 5</option>
      <option value={TEN}>Show 10</option>
      <option value={FIFTEEN}>Show 15</option>
      <option value={TWENTY}>Show 20</option>
    </select>
  </div>
);

const BarEditor = compose(
  connect(() => ({}), { updateModel, setInMetadata }),
  withHandlers({
    barChartGroupingLimitHandler: ({ updateModel: updateModelAction, model, setInMetadata: setInMetadataAction }) => (event) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'barChartGroupingLimit',
        value: parseInt(event.target.value)
      });

      setInMetadataAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: ['activePage'],
        value: 0
      });
    },
    sourceViewHandler: ({ updateModel: updateModelAction, model }) => {
      updateModelAction({
        schema: 'visualisation',
        id: model.get('_id'),
        path: 'sourceView',
        value: !model.get('sourceView')
      });
    }
  })
)(BarEditorComponent);

export default BarEditor;
