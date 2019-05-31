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
} from 'ui/utils/constants';
import TemplateCard from './TemplateCard';
import styles from './styles.css';

const TemplateCardList = ({ model, saveModel }) => (
  <div
    id="new-visualisation-templates"
    className={styles.cardList}>

    <TemplateCard
      title="How many statements have been stored in the last 7 days?"
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
      title="How has activity changed over time?"
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
      title="What are the most popular verbs?"
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
      title="What are the most popular activities?"
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
      title="Who are the most active people?"
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
      title="How does activity change in a week?"
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
