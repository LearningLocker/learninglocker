import React from 'react';
import {
  LEADERBOARD,
  STATEMENTS,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_CURATR_COMMENT_COUNT,
  TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS,
} from 'lib/constants/visualise';
import CustomBarChart from 'ui/containers/Visualisations/CustomBarChart';
import CustomColumnChart from 'ui/containers/Visualisations/CustomColumnChart';
import TemplateActivityOverTime from 'ui/containers/Visualisations/TemplateActivityOverTime';
import TemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements';
import TemplateMostActivePeople from 'ui/containers/Visualisations/TemplateMostActivePeople';
import TemplateMostPopularActivities from 'ui/containers/Visualisations/TemplateMostPopularActivities';
import TemplateMostPopularVerbs from 'ui/containers/Visualisations/TemplateMostPopularVerbs';
import TemplateWeekdaysActivity from 'ui/containers/Visualisations/TemplateWeekdaysActivity';
import TemplateCuratrInteractionsVsEngagement from 'ui/containers/Visualisations/TemplateCuratrInteractionsVsEngagement';
import TemplateCuratrCommentCount from 'ui/containers/Visualisations/TemplateCuratrCommentCount';
import TemplateCuratrLearnerInteractionsByDateAndVerb from 'ui/containers/Visualisations/TemplateCuratrLearnerInteractionsByDateAndVerb';
import TemplateCuratrUserEngagementLeaderboard from 'ui/containers/Visualisations/TemplateCuratrUserEngagementLeaderboard';
import TemplateCuratrProportionOfSocialInteractions from 'ui/containers/Visualisations/TemplateCuratrProportionOfSocialInteractions';
import TemplateCuratrActivitiesWithMostComments from 'ui/containers/Visualisations/TemplateCuratrActivitiesWithMostComments';
import StatementsForm from './StatementsForm';
import NewVisualisation from './NewVisualisation';

const VisualiseForm = ({ model, orgTimezone }) => {
  if (model.has('type')) {
    switch (model.get('type')) {
      case LEADERBOARD:
        return <CustomBarChart model={model} orgTimezone={orgTimezone} />;
      case STATEMENTS:
        return <CustomColumnChart model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_ACTIVITY_OVER_TIME:
        return <TemplateActivityOverTime model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_LAST_7_DAYS_STATEMENTS:
        return <TemplateLast7DaysStatements model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_MOST_ACTIVE_PEOPLE:
        return <TemplateMostActivePeople model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_MOST_POPULAR_ACTIVITIES:
        return <TemplateMostPopularActivities model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_MOST_POPULAR_VERBS:
        return <TemplateMostPopularVerbs model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_WEEKDAYS_ACTIVITY:
        return <TemplateWeekdaysActivity model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
        return <TemplateCuratrInteractionsVsEngagement model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_COMMENT_COUNT:
        return <TemplateCuratrCommentCount model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
        return <TemplateCuratrLearnerInteractionsByDateAndVerb model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
        return <TemplateCuratrUserEngagementLeaderboard model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
        return <TemplateCuratrProportionOfSocialInteractions model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
        return <TemplateCuratrActivitiesWithMostComments model={model} orgTimezone={orgTimezone} />;
      default:
        return <StatementsForm model={model} orgTimezone={orgTimezone} />;
    }
  }

  // A new visualisation does not have "type"
  return <NewVisualisation visualisationModel={model} />;
};

export default VisualiseForm;
