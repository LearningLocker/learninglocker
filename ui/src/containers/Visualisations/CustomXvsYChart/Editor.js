import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Tab } from 'react-toolbox/lib/tabs';
import Tabs from 'ui/components/Material/Tabs';
import ScatterAxesEditor from 'ui/containers/VisualiseForm/StatementsForm/AxesEditor/ScatterAxesEditor';
import AddQueryButton from '../components/AddQueryButton';
import DescriptionForm from '../components/DescriptionForm';
import FiltersForm from '../components/FiltersForm';
import PreviewPeriodPicker from '../components/PreviewPeriodPicker';
import StatsTopOrBottomSwitch from '../components/StatsTopOrBottomSwitch';
import ShowStatsSwitch from '../components/ShowStatsSwitch';
import SourceViewForm from '../components/SourceViewForm';
import TimezoneForm from '../components/TimezoneForm';
import TrendLinesSwitch from '../components/TrendLinesSwitch';
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

  const onClickAddQueryButton = useCallback(() => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'filters',
      value: model.get('filters').push(new Map()),
    });
  }, [id, model.get('filters').hashCode()]);

  const onChangeSourceView = useCallback((checked) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'sourceView',
      value: checked,
    });
  }, [id]);

  const onChangeShowStats = useCallback((checked) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'showStats',
      value: checked,
    });
  }, [id]);

  const onChangeStatsAtBottom = useCallback((checked) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'statsAtBottom',
      value: checked,
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

  const onChangeTrendLines = useCallback((checked) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'trendLines',
      value: checked,
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
              <ScatterAxesEditor model={model} orgTimezone={orgTimezone} />
            </Tab>

            <Tab key="series" label="Series">
              {model.get('filters').count() < 5 && (
              <AddQueryButton
                onClick={onClickAddQueryButton} />
              )}

              <FiltersForm
                visualisationId={id}
                filters={model.get('filters', new List())}
                canEditLabel
                timezone={model.get('timezone')}
                orgTimezone={orgTimezone}
                onChange={onChangeFilters} />
            </Tab>

            <Tab key="options" label="Options">

              <SourceViewForm
                sourceView={model.get('sourceView')}
                onChange={onChangeSourceView} />

              {model.get('sourceView') && (
                <ShowStatsSwitch
                  showStats={model.get('showStats')}
                  onChange={onChangeShowStats} />
              )}

              {model.get('sourceView') && model.get('showStats') && (
                <StatsTopOrBottomSwitch
                  statsAtBottom={model.get('statsAtBottom')}
                  onChange={onChangeStatsAtBottom} />
              )}

              {
                !model.get('sourceView') && (
                  <TrendLinesSwitch
                    showTrendLines={model.get('trendLines')}
                    onChange={onChangeTrendLines} />
                )
              }

              <TimezoneForm
                visualisationId={id}
                timezone={model.get('timezone', null)}
                orgTimezone={orgTimezone}
                onChange={onChangeTimezone} />
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
            visualisationId={id}
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
};

export default Editor;
