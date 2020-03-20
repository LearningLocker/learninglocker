import React from 'react';
import { CardList } from 'ui/containers/VisualiseForm/NewVisualisation/styled';
import TemplateActivityOverTimeCard from 'ui/containers/Visualisations/TemplateActivityOverTime/Card';
import TemplateLast7DaysStatementsCard from 'ui/containers/Visualisations/TemplateLast7DaysStatements/Card';
import TemplateMostPopularVerbsCard from 'ui/containers/Visualisations/TemplateMostPopularVerbs/Card';
import TemplateMostPopularActivitiesCard from 'ui/containers/Visualisations/TemplateMostPopularActivities/Card';
import TemplateMostActivePeopleCard from 'ui/containers/Visualisations/TemplateMostActivePeople/Card';
import TemplateWeekdaysActivityCard from 'ui/containers/Visualisations/TemplateWeekdaysActivity/Card';
import TemplateStreamInteractionsVsEngagementCard from 'ui/containers/Visualisations/TemplateStreamInteractionsVsEngagement/Card';
import TemplateStreamCommentCountCard from 'ui/containers/Visualisations/TemplateStreamCommentCount/Card';
import TemplateStreamLearnerInteractionsByDateAndVerbCard from 'ui/containers/Visualisations/TemplateStreamLearnerInteractionsByDateAndVerb/Card';
import TemplateStreamUserEngagementLeaderboardCard from 'ui/containers/Visualisations/TemplateStreamUserEngagementLeaderboard/Card';
import TemplateStreamProportionOfSocialInteractionsCard from 'ui/containers/Visualisations/TemplateStreamProportionOfSocialInteractions/Card';
import TemplateStreamActivitiesWithMostCommentsCard from 'ui/containers/Visualisations/TemplateStreamActivitiesWithMostComments/Card';
import TemplateLearningExperienceType from 'ui/containers/Visualisations/TemplateLearningExperienceType/Card';

const TemplateCardList = ({ model, saveModel }) => (
  <CardList id="new-visualisation-templates">
    <TemplateLearningExperienceType
      model={model}
      saveModel={saveModel} />

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

    <TemplateStreamInteractionsVsEngagementCard
      model={model}
      saveModel={saveModel} />

    <TemplateStreamCommentCountCard
      model={model}
      saveModel={saveModel} />

    <TemplateStreamLearnerInteractionsByDateAndVerbCard
      model={model}
      saveModel={saveModel} />

    <TemplateStreamUserEngagementLeaderboardCard
      model={model}
      saveModel={saveModel} />

    <TemplateStreamProportionOfSocialInteractionsCard
      model={model}
      saveModel={saveModel} />

    <TemplateStreamActivitiesWithMostCommentsCard
      model={model}
      saveModel={saveModel} />
  </CardList>
);

export default TemplateCardList;
