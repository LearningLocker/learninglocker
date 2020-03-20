import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { connect } from 'react-redux';
import { compose, withState, withHandlers, setPropTypes, withProps } from 'recompose';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import Spinner from 'ui/components/Spinner';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { withSchema } from 'ui/utils/hocs';
import AddModelPrompt from './AddModelPrompt';
import ExportDownloadManager from './ExportDownloadManager';
import ExportForm from './ExportForm';

const schema = 'export';

const enhance = compose(
  withSchema(schema),
  withState('activeTab', 'setActiveTab', 0),
  withState('selectedExportId', 'setSelectedExportId'),
  connect(state => ({
    userId: loggedInUserId(state)
  })),
  withHandlers({
    onAddExport: ({ addModel, userId, setSelectedExportId }) => async () => {
      const { model } = await addModel({ props: { owner: userId, name: 'New Export' } });
      setSelectedExportId(model.get('_id'));
    },
    setSelectedExport: ({ setSelectedExportId }) => (model) => {
      if (model) return setSelectedExportId(model.get('_id'));
      setSelectedExportId(null);
    }
  }),
  withProps(({ models, selectedExportId }) => {
    if (selectedExportId) return { selectedExportId };
    if (models.size > 0) {
      return {
        selectedExportId: models.first().get('_id')
      };
    }
    return {};
  }),
  setPropTypes({
    activeTab: PropTypes.number.isRequired,
    pipelines: PropTypes.instanceOf(List).isRequired,
    models: PropTypes.instanceOf(Map).isRequired,
    setActiveTab: PropTypes.func.isRequired,
    setSelectedExportId: PropTypes.func.isRequired,
    setSelectedExport: PropTypes.func.isRequired,
    onAddExport: PropTypes.func.isRequired,
    selectedExportId: PropTypes.string,
  })
);

const renderSelectedExport = ({ pipelines, selectedExportId, setSelectedExport }) => (
  <div>
    <div key={0} style={{ display: 'flex' }}>
      <ModelAutoComplete
        schema={schema}
        id={selectedExportId}
        parseOption={model => model.get('name')}
        parseOptionTooltip={model => model.get('name')}
        onChange={setSelectedExport} />
    </div>
    <ExportForm
      key={1}
      id={selectedExportId}
      pipelines={pipelines} />
  </div>
);

const renderNoExport = onAddExport => (
  <AddModelPrompt
    message="No exports configured yet! Add one to get started."
    schema={schema}
    onAdd={onAddExport} />
);

const renderExports = ({ isLoading, models, pipelines, selectedExportId, setSelectedExport, onAddExport }) => {
  if (isLoading) return <Spinner />;
  if (models.size > 0) {
    return renderSelectedExport({
      pipelines,
      selectedExportId,
      setSelectedExport,
      onAddExport
    });
  }
  return renderNoExport(onAddExport);
};

const render = ({
  models,
  isLoading,
  pipelines,
  selectedExportId,
  setSelectedExport,
  onAddExport,
  activeTab,
  setActiveTab,
}) => (
  <Tabs index={activeTab} onChange={setActiveTab}>
    <Tab label="Manage">
      <div>
        {renderExports({ isLoading, models, pipelines, selectedExportId, setSelectedExport, onAddExport })}
      </div>
    </Tab>
    <Tab label="Downloads">
      <ExportDownloadManager />
    </Tab>
  </Tabs>
  );

export default enhance(render);
