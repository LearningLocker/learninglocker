import React from 'react';
import {
  LEADERBOARD,
} from 'ui/utils/constants';
import CustomBarChart from 'ui/containers/Visualisations/CustomBarChart';
import StatementsForm from './StatementsForm';
import NewVisualisation from './NewVisualisation';

const VisualiseForm = ({ model, orgTimezone }) => {
  if (model.has('type')) {
    // [Viz Refactor] Add a case/if-branch after a type and custom/template is migrated
    if (model.has('templateId')) {
      return <StatementsForm model={model} orgTimezone={orgTimezone} />;
    }

    switch (model.get('type')) {
      case LEADERBOARD:
        return <CustomBarChart model={model} orgTimezone={orgTimezone} />;
      default:
        return <StatementsForm model={model} orgTimezone={orgTimezone} />;
    }
  }

  // A new visualisation does not have "type"
  return <NewVisualisation visualisationModel={model} />;
};

export default VisualiseForm;
