import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { withProps, compose } from 'recompose';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { TEMPLATE_STAGE_INTERMEDIATE, TEMPLATE_STAGE_COMPLETED } from 'lib/constants/visualise';
import { withModel } from 'ui/utils/hocs';
import templateData from './templateData';
import TemplateCard from './TemplateCard';
import TemplateIntermediateStage from './TemplateIntermediateStage';
import TypeEditor from './TypeEditor';
import styles from './styles.css';

class NewVisualisation extends React.PureComponent {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func,
  }

  onSelectTemplate = (selectedTemplateId, type) => {
    const updateModel = this.props.updateModel;
    updateModel({
      path: ['type'],
      value: type
    });
    updateModel({
      path: ['templateId'],
      value: selectedTemplateId
    });

    const nextStage = templateData.getIn([selectedTemplateId, 'hasIntermediate'], false)
      ? TEMPLATE_STAGE_INTERMEDIATE
      : TEMPLATE_STAGE_COMPLETED;
    updateModel({
      path: ['templateStage'],
      value: nextStage
    });

    const onCreate = templateData.getIn([selectedTemplateId, 'onCreate'], () => null);
    onCreate(updateModel);
  }

  render = () => {
    const { model, updateModel } = this.props;
    const templateId = model.get('templateId');

    if (templateId) {
      const settings = templateData.get(templateId);
      if (!settings) {
        throw new Error(`templateData does not have template id ${templateId}`);
      }
      return (
        <TemplateIntermediateStage
          settings={settings}
          model={model}
          updateModel={updateModel} />
      );
    }

    return (
      <div>
        <label htmlFor="new-visualisation-custom" >Custom</label>
        <TypeEditor
          id="new-visualisation-custom"
          model={model} />

        <label htmlFor="new-visualisation-templates" >Templates</label>
        <div
          id="new-visualisation-templates"
          className={styles.cardList}>
          {templateData.map(t => (
            <TemplateCard
              key={t.get('id')}
              title={t.get('title')}
              type={t.get('type')}
              onSelect={() => this.onSelectTemplate(t.get('id'), t.get('type'))} />
            )).valueSeq()}
        </div>
      </div>
    );
  };
}

export default compose(
  withProps(props => ({
    schema: 'visualisation',
    id: props.visualisationModel.get('_id'),
  })),
  withModel,
  withStyles(styles),
)(NewVisualisation);
