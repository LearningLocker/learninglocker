import React from 'react';
import { withProps, compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { withModel } from 'ui/utils/hocs';
import TypeEditor from './TypeEditor';
import TemplateCardList from './TemplateCardList';
import styles from './styles.css';

const NewVisualisation = ({
  model,
  saveModel,
}) => (
  <div>
    <label htmlFor="new-visualisation-custom" >
      Custom
    </label>
    <TypeEditor model={model} />

    <label htmlFor="new-visualisation-templates" >
      Templates
    </label>
    <TemplateCardList model={model} saveModel={saveModel} />
  </div>
);

export default compose(
  withProps(props => ({
    schema: 'visualisation',
    id: props.visualisationModel.get('_id'),
  })),
  withModel,
  withStyles(styles),
)(NewVisualisation);
