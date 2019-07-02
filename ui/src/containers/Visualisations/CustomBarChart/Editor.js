import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tab } from 'react-toolbox/lib/tabs';
import Tabs from 'ui/components/Material/Tabs';
import AxesEditor from 'ui/containers/VisualiseForm/StatementsForm/AxesEditor';
import VisualiseFilterForm from 'ui/containers/VisualiseFilterForm';
import {
  AddQueryButton,
  BarChartGroupingLimitForm,
  DescriptionForm,
  PreviewPeriodPicker,
  SourceViewForm,
  StackedSwitch,
  TimezoneForm,
} from '../components';
import Viewer from './Viewer';

/**
 * @param {immutable.Map} props.model - visualisation model
 * @param {string} props.orgTimezone
 * @param {(args: object) => void} props.updateModel
 * @param {(args: object) => void} props.setInMetadata
 */
const Editor = ({
  model,
  orgTimezone,
  updateModel,
  setInMetadata,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div className="row">
      <div className="col-md-6 left-border">
        <div>
          <DescriptionForm
            visualisationId={model.get('_id')}
            description={model.get('description', '')}
            onChange={(description) => {
              updateModel({
                schema: 'visualisation',
                id: model.get('_id'),
                path: 'description',
                value: description,
              });
            }} />

          <Tabs index={tabIndex} onChange={setTabIndex}>
            <Tab key="axes" label="Axes">
              <AxesEditor
                model={model}
                orgTimezone={orgTimezone} />
            </Tab>

            <Tab key="series" label="Series">
              {model.get('filters').count() < 5 && (
                <AddQueryButton
                  onClick={() => {
                    updateModel({
                      schema: 'visualisation',
                      id: model.get('_id'),
                      path: 'filters',
                      value: model.get('filters').push(new Map()),
                    });
                  }} />
              )}

              <StackedSwitch
                visualisationId={model.get('_id')}
                stacked={model.get('stacked', true)}
                onChange={(stacked) => {
                  updateModel({
                    schema: 'visualisation',
                    id: model.get('_id'),
                    path: 'stacked',
                    value: stacked,
                  });
                }} />

              <VisualiseFilterForm
                model={model}
                orgTimezone={orgTimezone} />
            </Tab>

            <Tab key="options" label="Options">
              <SourceViewForm
                sourceView={model.get('sourceView')}
                onChange={(checked) => {
                  updateModel({
                    schema: 'visualisation',
                    id: model.get('_id'),
                    path: 'sourceView',
                    value: checked,
                  });
                }} />

              <BarChartGroupingLimitForm
                barChartGroupingLimit={model.get('barChartGroupingLimit')}
                onChange={(limit) => {
                  updateModel({
                    schema: 'visualisation',
                    id: model.get('_id'),
                    path: 'barChartGroupingLimit',
                    value: limit,
                  });

                  setInMetadata({
                    schema: 'visualisation',
                    id: model.get('_id'),
                    path: ['activePage'],
                    value: 0,
                  });
                }} />

              <TimezoneForm
                visualisationId={model.get('_id')}
                timezone={model.get('timezone', null)}
                orgTimezone={orgTimezone}
                onChange={(timezone) => {
                  updateModel({
                    schema: 'visualisation',
                    id: model.get('_id'),
                    path: 'timezone',
                    value: timezone,
                  });
                }} />
            </Tab>
          </Tabs>
        </div>
      </div>

      <div className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          <PreviewPeriodPicker
            visualisationId={model.get('_id')}
            previewPeriod={model.get('previewPeriod')}
            onChange={(previewPeriod) => {
              updateModel({
                schema: 'visualisation',
                id: model.get('_id'),
                path: 'previewPeriod',
                value: previewPeriod,
              });
            }} />
        </div>

        <div style={{ height: '400px', paddingTop: 5 }}>
          <Viewer
            visualisationId={model.get('_id')}
            showSourceView={model.get('sourceView')} />
        </div>
      </div>
    </div>
  );
};

Editor.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  orgTimezone: PropTypes.string.isRequired,
  updateModel: PropTypes.func.isRequired,
  setInMetadata: PropTypes.func.isRequired,
};

export default Editor;
