import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import {
  LEADERBOARD,
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
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
import { withModel } from 'ui/utils/hocs';
import CustomBarChartViewer from './CustomBarChart/Viewer';
import CustomColumnChartViewer from './CustomColumnChart/Viewer';
import CustomCounterViewer from './CustomCounter/Viewer';
import CustomLineChartViewer from './CustomLineChart/Viewer';
import CustomPieChartViewer from './CustomPieChart/Viewer';
import CustomXvsYChartViewer from './CustomXvsYChart/Viewer';
import TemplateActivityOverTime from './TemplateActivityOverTime/Viewer';
import TemplateLast7DaysStatements from './TemplateLast7DaysStatements/Viewer';
import TemplateMostActivePeople from './TemplateMostActivePeople/Viewer';
import TemplateMostPopularActivities from './TemplateMostPopularActivities/Viewer';
import TemplateMostPopularVerbs from './TemplateMostPopularVerbs/Viewer';
import TemplateWeekdaysActivity from './TemplateWeekdaysActivity/Viewer';
import TemplateStreamInteractionsVsEngagement from './TemplateStreamInteractionsVsEngagement/Viewer';
import TemplateStreamCommentCount from './TemplateStreamCommentCount/Viewer';
import TemplateStreamLearnerInteractionsByDateAndVerb from './TemplateStreamLearnerInteractionsByDateAndVerb/Viewer';
import TemplateStreamUserEngagementLeaderboard from './TemplateStreamUserEngagementLeaderboard/Viewer';
import TemplateStreamProportionOfSocialInteractions from './TemplateStreamProportionOfSocialInteractions/Viewer';
import TemplateStreamActivitiesWithMostComments from './TemplateStreamActivitiesWithMostComments/Viewer';
import TemplateLearningExperienceType from './TemplateLearningExperienceType/Viewer';

/**
 * @param {immutable.Map} model - visualisation model
 */
const VisualisationViewer = ({
  model,
}) => {
  const visualisationId = model.get('_id');
  const type = model.get('type');
  const showSourceView = model.get('sourceView');

  if (type === null || type === undefined) {
    return null;
  }

  switch (type) {
    case LEADERBOARD:
      return <CustomBarChartViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case STATEMENTS:
      return <CustomColumnChartViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case COUNTER:
      return <CustomCounterViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case XVSY:
      return <CustomXvsYChartViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case FREQUENCY:
      return <CustomLineChartViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case PIE:
      return <CustomPieChartViewer visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return <TemplateActivityOverTime visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
      return <TemplateLast7DaysStatements visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
      return <TemplateMostActivePeople visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
      return <TemplateMostPopularActivities visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_MOST_POPULAR_VERBS:
      return <TemplateMostPopularVerbs visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_WEEKDAYS_ACTIVITY:
      return <TemplateWeekdaysActivity visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT:
      return <TemplateStreamInteractionsVsEngagement visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_COMMENT_COUNT:
      return <TemplateStreamCommentCount visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
      return <TemplateStreamLearnerInteractionsByDateAndVerb visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD:
      return <TemplateStreamUserEngagementLeaderboard visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS:
      return <TemplateStreamProportionOfSocialInteractions visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS:
      return <TemplateStreamActivitiesWithMostComments visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
      return <TemplateLearningExperienceType visualisationId={visualisationId} showSourceView={showSourceView} />;
    default:
      console.error(`VisualisationViewer.js does not support type "${type}"`);
      return `Type "${type}" is not supported`;
  }
};

VisualisationViewer.propTypes = {
  model: PropTypes.instanceOf(Map).isRequired,
};

// This withModel is for fetching visualisation in Dashboard
/**
 * @param {string} id - visualisation._id
 */
export default compose(
  withProps({ schema: 'visualisation' }),
  withModel,
)(VisualisationViewer);
