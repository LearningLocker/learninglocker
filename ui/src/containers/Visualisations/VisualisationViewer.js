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
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
  TEMPLATE_CURATR_COMMENT_COUNT,
  TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB,
  TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD,
  TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS,
  TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS,
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
import TemplateCuratrInteractionsVsEngagement from './TemplateCuratrInteractionsVsEngagement/Viewer';
import TemplateCuratrCommentCount from './TemplateCuratrCommentCount/Viewer';
import TemplateCuratrLearnerInteractionsByDateAndVerb from './TemplateCuratrLearnerInteractionsByDateAndVerb/Viewer';
import TemplateCuratrUserEngagementLeaderboard from './TemplateCuratrUserEngagementLeaderboard/Viewer';
import TemplateCuratrProportionOfSocialInteractions from './TemplateCuratrProportionOfSocialInteractions/Viewer';
import TemplateCuratrActivitiesWithMostComments from './TemplateCuratrActivitiesWithMostComments/Viewer';

/**
 * @param {immutable.Map} model - visualisation model
 */
const VisualisationViewer = ({
  model,
}) => {
  const visualisationId = model.get('_id');
  const type = model.get('type');
  const showSourceView = model.get('sourceView');

  if (type === null) {
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
    case TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT:
      return <TemplateCuratrInteractionsVsEngagement visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_CURATR_COMMENT_COUNT:
      return <TemplateCuratrCommentCount visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_CURATR_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
      return <TemplateCuratrLearnerInteractionsByDateAndVerb visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_CURATR_USER_ENGAGEMENT_LEADERBOARD:
      return <TemplateCuratrUserEngagementLeaderboard visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_CURATR_PROPORTION_OF_SOCIAL_INTERACTIONS:
      return <TemplateCuratrProportionOfSocialInteractions visualisationId={visualisationId} showSourceView={showSourceView} />;
    case TEMPLATE_CURATR_ACTIVITIES_WITH_MOST_COMMENTS:
      return <TemplateCuratrActivitiesWithMostComments visualisationId={visualisationId} showSourceView={showSourceView} />;
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
