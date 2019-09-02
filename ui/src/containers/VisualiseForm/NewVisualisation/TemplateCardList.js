import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TemplateActivityOverTimeCard from 'ui/containers/Visualisations/TemplateActivityOverTime/Card';
import TemplateLast7DaysStatementsCard from 'ui/containers/Visualisations/TemplateLast7DaysStatements/Card';
import TemplateMostPopularVerbsCard from 'ui/containers/Visualisations/TemplateMostPopularVerbs/Card';
import TemplateMostPopularActivitiesCard from 'ui/containers/Visualisations/TemplateMostPopularActivities/Card';
import TemplateMostActivePeopleCard from 'ui/containers/Visualisations/TemplateMostActivePeople/Card';
import TemplateWeekdaysActivityCard from 'ui/containers/Visualisations/TemplateWeekdaysActivity/Card';
import TemplateCuratrInteractionsVsEngagementCard from 'ui/containers/Visualisations/TemplateCuratrInteractionsVsEngagement/Card';
import TemplateCuratrCommentCountCard from 'ui/containers/Visualisations/TemplateCuratrCommentCount/Card';
import TemplateCuratrLearnerInteractionsByDateAndVerbCard from 'ui/containers/Visualisations/TemplateCuratrLearnerInteractionsByDateAndVerb/Card';
import TemplateCuratrUserEngagementLeaderboardCard from 'ui/containers/Visualisations/TemplateCuratrUserEngagementLeaderboard/Card';
import TemplateCuratrProportionOfSocialInteractionsCard from 'ui/containers/Visualisations/TemplateCuratrProportionOfSocialInteractions/Card';
import TemplateCuratrActivitiesWithMostCommentsCard from 'ui/containers/Visualisations/TemplateCuratrActivitiesWithMostComments/Card';
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

    <TemplateCuratrInteractionsVsEngagementCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrCommentCountCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrLearnerInteractionsByDateAndVerbCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrUserEngagementLeaderboardCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrProportionOfSocialInteractionsCard
      model={model}
      saveModel={saveModel} />

    <TemplateCuratrActivitiesWithMostCommentsCard
      model={model}
      saveModel={saveModel} />
  </div>
);

export default withStyles(styles)(TemplateCardList);
