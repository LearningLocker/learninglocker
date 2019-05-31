import React from 'react';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { TEMPLATE_STAGE_COMPLETED } from 'lib/constants/visualise';
import {
  LEADERBOARD,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  LAST_2_MONTHS,
  VISUALISATION_TEMPLATE_TITLES,
} from 'ui/utils/constants';
import TemplateCard from './TemplateCard';
import styles from './styles.css';

const TemplateCardList = ({ model, saveModel }) => (
  <div
    id="new-visualisation-templates"
    className={styles.cardList}>

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['1']}
      type={COUNTER}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', COUNTER)
            .set('templateId', '1')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED),
        });
      }} />

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['2']}
      type={FREQUENCY}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', FREQUENCY)
            .set('templateId', '2')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED)
            .set('previewPeriod', LAST_2_MONTHS),
        });
      }} />

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['3']}
      type={LEADERBOARD}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', LEADERBOARD)
            .set('templateId', '3')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED)
            .set('previewPeriod', LAST_2_MONTHS)
            .set('axesgroup', new Map({ optionKey: 'verb', searchString: 'Verb' })),
        });
      }} />

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['4']}
      type={LEADERBOARD}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', LEADERBOARD)
            .set('templateId', '4')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED)
            .set('previewPeriod', LAST_2_MONTHS)
            .set('axesgroup', new Map({ optionKey: 'activities', searchString: 'Activity' })),
        });
      }} />

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['5']}
      type={LEADERBOARD}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', LEADERBOARD)
            .set('templateId', '5')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED)
            .set('previewPeriod', LAST_2_MONTHS)
            .set('axesgroup', new Map({ optionKey: 'people', searchString: 'Person' })),
        });
      }} />

    <TemplateCard
      title={VISUALISATION_TEMPLATE_TITLES['6']}
      type={STATEMENTS}
      onSelect={() => {
        saveModel({
          attrs: model
            .set('type', STATEMENTS)
            .set('templateId', '6')
            .set('templateStage', TEMPLATE_STAGE_COMPLETED)
            .set('axesgroup', new Map({ optionKey: 'weekday', searchString: 'Day' })),
        });
      }} />

  </div>
);

export default withStyles(styles)(TemplateCardList);
