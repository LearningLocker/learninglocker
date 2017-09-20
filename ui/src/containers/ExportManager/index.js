import React, { PropTypes } from 'react';
import { Map, List } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Tabs from 'ui/components/Material/Tabs';
import { Tab } from 'react-toolbox/lib/tabs';
import { connect } from 'react-redux';
import { compose, withState, withHandlers, setPropTypes, withProps } from 'recompose';
import AddModelPrompt from 'ui/components/AddModelPrompt';
import ExportForm from 'ui/components/ExportForm';
import ModelAutoComplete from 'ui/containers/ModelAutoComplete';
import ExportDownloadManager from 'ui/containers/ExportDownloadManager';
import Spinner from 'ui/components/Spinner';
import { loggedInUserId } from 'ui/redux/modules/auth';
import { withSchema } from 'ui/utils/hocs';
import styles from './styles.css';

const schema = 'export';

const enhance = compose(
  withStyles(styles),
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
    <div key={0} className={styles.pickerContainer}>
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
        { renderExports({ isLoading, models, pipelines, selectedExportId, setSelectedExport, onAddExport }) }
      </div>
    </Tab>
    <Tab label="Downloads">
      <ExportDownloadManager />
    </Tab>
  </Tabs>
);

export default enhance(render);
