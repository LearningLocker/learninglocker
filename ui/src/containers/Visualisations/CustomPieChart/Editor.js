import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Tab } from 'react-toolbox/lib/tabs';
import Tabs from 'ui/components/Material/Tabs';
import PieAxesEditor from 'ui/containers/VisualiseForm/StatementsForm/AxesEditor/PieAxesEditor';
import VisualiseFilterForm from 'ui/containers/VisualiseFilterForm';
import AddQueryButton from '../components/AddQueryButton';
import DescriptionForm from '../components/DescriptionForm';
import PreviewPeriodPicker from '../components/PreviewPeriodPicker';
import StatsTopOrBottomSwitch from '../components/StatsTopOrBottomSwitch';
import ShowStatsSwitch from '../components/ShowStatsSwitch';
import SourceViewForm from '../components/SourceViewForm';
import IsDonutSwitch from '../components/IsDonutSwitch';
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

  const onClickAddQueryButton = useCallback(() => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'filters',
      value: model.get('filters').push(new Map()),
    });
  }, [id, model.get('filters').hashCode()]);

  const onChangeIsDonut = useCallback((isDonut) => {
    updateModel({
      schema: 'visualisation',
      id,
      path: 'isDonut',
      value: isDonut,
    });
  }, [id]);

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
              <PieAxesEditor model={model} />
            </Tab>

            <Tab key="series" label="Series">
              {model.get('filters').count() < 5 && (
              <AddQueryButton
                onClick={onClickAddQueryButton} />
              )}

              <VisualiseFilterForm
                model={model}
                orgTimezone={orgTimezone} />
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

              <IsDonutSwitch
                isDonut={model.get('isDonut')}
                onChange={onChangeIsDonut} />

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
