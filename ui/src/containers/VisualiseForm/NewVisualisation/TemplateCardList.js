import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { default as TemplateActivityOverTimeCard } from 'ui/containers/Visualisations/TemplateActivityOverTime/Card';
import { default as TemplateLast7DaysStatementsCard } from 'ui/containers/Visualisations/TemplateLast7DaysStatements/Card';
import { default as TemplateMostPopularVerbsCard } from 'ui/containers/Visualisations/TemplateMostPopularVerbs/Card';
import { default as TemplateMostPopularActivitiesCard } from 'ui/containers/Visualisations/TemplateMostPopularActivities/Card';
import { default as TemplateMostActivePeopleCard } from 'ui/containers/Visualisations/TemplateMostActivePeople/Card';
import { default as TemplateWeekdaysActivityCard } from 'ui/containers/Visualisations/TemplateWeekdaysActivity/Card';
import { default as TemplateCuratrCommentCountCard } from 'ui/containers/Visualisations/TemplateCuratrCommentCount/Card';
import styles from './styles.css';

const TemplateCardList = ({ model, saveModel }) => (
  <div
    id="new-visualisation-templates"
    className={styles.cardList}>

    <TemplateLast7DaysStatementsCard
      model={model}
      saveModel={saveModel} />

    <TemplateActivityOverTimeCard
      model={model}
      saveModel={saveModel} />

    <TemplateMostPopularVerbsCard
      model={model}
      saveModel={saveModel} />

    <TemplateMostPopularActivitiesCard
      model={model}
      saveModel={saveModel} />

    <TemplateMostActivePeopleCard
      model={model}
      saveModel={saveModel} />

    <TemplateWeekdaysActivityCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrCommentCountCard
      model={model}
      saveModel={saveModel} />
  </div>
);

export default withStyles(styles)(TemplateCardList);
