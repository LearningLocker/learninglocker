import React from 'react';
import { withProps, compose } from 'recompose';
import { withModel } from 'ui/utils/hocs';
import TypeEditor from './TypeEditor';
import TemplateCardList from './TemplateCardList';

const NewVisualisation = ({
  model,
  saveModel,
}) => (
  <div className="row">
    <div className="col-md-12 left-border">
      <label htmlFor="new-visualisation-custom" >
        Custom
      </label>
      <TypeEditor model={model} saveModel={saveModel} />

      <label htmlFor="new-visualisation-templates" >
        Templates
      </label>
      <TemplateCardList model={model} saveModel={saveModel} />
    </div>
  </div>
);

export default compose(
  withProps(props => ({
    schema: 'visualisation',
    id: props.visualisationModel.get('_id'),
  })),
  withModel,
)(NewVisualisation);
