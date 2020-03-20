import React from 'react';
import {
  LEADERBOARD,
  STATEMENTS,
  COUNTER,
  XVSY,
  FREQUENCY,
  PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_STREAM_COMMENT_COUNT,
  TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS,
  TEMPLATE_LEARNING_EXPERIENCE_TYPE,
} from 'lib/constants/visualise';
import CustomBarChart from 'ui/containers/Visualisations/CustomBarChart';
import CustomColumnChart from 'ui/containers/Visualisations/CustomColumnChart';
import CustomCounter from 'ui/containers/Visualisations/CustomCounter';
import CustomXvsYChart from 'ui/containers/Visualisations/CustomXvsYChart';
import CustomLineChart from 'ui/containers/Visualisations/CustomLineChart';
import CustomPieChart from 'ui/containers/Visualisations/CustomPieChart';
import TemplateActivityOverTime from 'ui/containers/Visualisations/TemplateActivityOverTime';
import TemplateLast7DaysStatements from 'ui/containers/Visualisations/TemplateLast7DaysStatements';
import TemplateMostActivePeople from 'ui/containers/Visualisations/TemplateMostActivePeople';
import TemplateMostPopularActivities from 'ui/containers/Visualisations/TemplateMostPopularActivities';
import TemplateMostPopularVerbs from 'ui/containers/Visualisations/TemplateMostPopularVerbs';
import TemplateWeekdaysActivity from 'ui/containers/Visualisations/TemplateWeekdaysActivity';
import TemplateStreamInteractionsVsEngagement from 'ui/containers/Visualisations/TemplateStreamInteractionsVsEngagement';
import TemplateStreamCommentCount from 'ui/containers/Visualisations/TemplateStreamCommentCount';
import TemplateStreamLearnerInteractionsByDateAndVerb from 'ui/containers/Visualisations/TemplateStreamLearnerInteractionsByDateAndVerb';
import TemplateStreamUserEngagementLeaderboard from 'ui/containers/Visualisations/TemplateStreamUserEngagementLeaderboard';
import TemplateStreamProportionOfSocialInteractions from 'ui/containers/Visualisations/TemplateStreamProportionOfSocialInteractions';
import TemplateStreamActivitiesWithMostComments from 'ui/containers/Visualisations/TemplateStreamActivitiesWithMostComments';
import TemplateLearningExperienceType from 'ui/containers/Visualisations/TemplateLearningExperienceType';
import NewVisualisation from './NewVisualisation';

const VisualiseForm = ({ model, orgTimezone }) => {
  if (model.has('type')) {
    switch (model.get('type')) {
      case LEADERBOARD:
        return <CustomBarChart model={model} orgTimezone={orgTimezone} />;
      case STATEMENTS:
        return <CustomColumnChart model={model} orgTimezone={orgTimezone} />;
      case COUNTER:
        return <CustomCounter model={model} orgTimezone={orgTimezone} />;
      case XVSY:
        return <CustomXvsYChart model={model} orgTimezone={orgTimezone} />;
      case FREQUENCY:
        return <CustomLineChart model={model} orgTimezone={orgTimezone} />;
      case PIE:
        return <CustomPieChart model={model} orgTimezone={orgTimezone} />;
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
      case TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT:
        return <TemplateStreamInteractionsVsEngagement model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_STREAM_COMMENT_COUNT:
        return <TemplateStreamCommentCount model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
        return <TemplateStreamLearnerInteractionsByDateAndVerb model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD:
        return <TemplateStreamUserEngagementLeaderboard model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS:
        return <TemplateStreamProportionOfSocialInteractions model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS:
        return <TemplateStreamActivitiesWithMostComments model={model} orgTimezone={orgTimezone} />;
      case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
        return <TemplateLearningExperienceType model={model} orgTimezone={orgTimezone} />;
      default:
        console.error(`VisualiseForm/index.js does not support type ${model.get('type')}`);
        return `type "${model.get('type')}" is not supported.`;
    }
  }

  // A new visualisation does not have "type"
  return <NewVisualisation visualisationModel={model} />;
};

export default VisualiseForm;
