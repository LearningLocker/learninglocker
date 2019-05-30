import React from 'react';
import StatementsForm from './StatementsForm/StatementsForm';

const VisualiseForm = ({ model, orgTimezone, exportVisualisation }) =>
  <StatementsForm
    model={model}
    orgTimezone={orgTimezone}
    exportVisualisation={exportVisualisation} />;

export default VisualiseForm;
