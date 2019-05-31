import React from 'react';
import StatementsForm from './StatementsForm';
import NewVisualisation from './NewVisualisation';

const VisualiseForm = ({ model, exportVisualisation }) => {
  if (model.has('type')) {
    return (
      <StatementsForm
        model={model}
        exportVisualisation={exportVisualisation} />
    );
  }

  // A new visualisation does not have "type"
  return <NewVisualisation visualisationModel={model} />;
};

export default VisualiseForm;
