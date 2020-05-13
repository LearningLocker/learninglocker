import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Tab } from 'react-toolbox/lib/tabs';
import Tabs from 'ui/components/Material/Tabs';
import CounterAxesEditor from 'ui/containers/VisualiseForm/StatementsForm/AxesEditor/CounterAxesEditor';
import BenchmarkingEnabledSwitch from '../components/BenchmarkingEnabledSwitch';
import DescriptionForm from '../components/DescriptionForm';
import ContextLabelForm from '../components/ContextLabelForm';
import FiltersForm from '../components/FiltersForm';
import PreviewPeriodPicker from '../components/PreviewPeriodPicker';
import TimezoneForm from '../components/TimezoneForm';
import Viewer from './Viewer';

/**
 * @param {immutable.Map} props.model - visualisation model
 * @param {string} props.orgTimezone
 * @param {(args: object) => void} props.updateModel
 */
const Editor = ({
  model,
  orgTimezone,
  updateModel,
}) => {
  const id = model.get('_id');
  const [tabIndex, setTabIndex] = useState(0);

  const onChangeDescription = useCallback((description) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'description',
      value: description,
    });
  }, [id]);

  const onChangeContextLabel = useCallback((contextLabel) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'contextLabel',
      value: contextLabel,
    });
  }, [id]);

  const onChangeFilters = useCallback((filters) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'filters',
      value: filters,
    });
  }, [id]);

  const onChangeTimezone = useCallback((timezone) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'timezone',
      value: timezone,
    });
  }, [id]);

  const onChangePreviewPeriod = useCallback((previewPeriod) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'previewPeriod',
      value: previewPeriod,
    });
  }, [id]);

  const onChangeBenchmarkingEnabled = useCallback((benchmarkingEnabled) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'benchmarkingEnabled',
      value: benchmarkingEnabled,
    });
  }, [id]);

  return (
    <div className="row">
      <div className="col-md-6 left-border">
        <div>
          <DescriptionForm
            visualisationId={id}
            description={model.get('description', '')}
            onChange={onChangeDescription} />

          <Tabs index={tabIndex} onChange={setTabIndex}>
            <Tab key="axes" label="Axes">
              <CounterAxesEditor model={model} />
            </Tab>

            <Tab key="series" label="Series">
              <FiltersForm
                visualisationId={id}
                filters={model.get('filters', new List())}
                canEditLabel={false}
                timezone={model.get('timezone')}
                orgTimezone={orgTimezone}
                onChange={onChangeFilters} />
            </Tab>

            <Tab key="options" label="Options">
              <BenchmarkingEnabledSwitch
                visualisationId={id}
                benchmarkingEnabled={model.get('benchmarkingEnabled')}
                onChange={onChangeBenchmarkingEnabled} />

              <TimezoneForm
                visualisationId={id}
                timezone={model.get('timezone', null)}
                orgTimezone={orgTimezone}
                onChange={onChangeTimezone} />

              <ContextLabelForm
                visualisationId={id}
                contextLabel={model.get('contextLabel')}
                onChange={onChangeContextLabel} />
            </Tab>
          </Tabs>
        </div>
      </div>

      <div className="col-md-6">
        <div className="form-group form-inline" style={{ textAlign: 'right' }}>
          <PreviewPeriodPicker
            visualisationId={id}
            previewPeriod={model.get('previewPeriod')}
            onChange={onChangePreviewPeriod} />
        </div>

        <div style={{ height: '400px', paddingTop: 5 }}>
          <Viewer
            visualisationId={id} />
        </div>
      </div>
    </div>
  );
};

Editor.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
  orgTimezone: PropTypes.string.isRequired,
  updateModel: PropTypes.func.isRequired,
};

export default Editor;
