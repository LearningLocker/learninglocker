import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { compose, withProps } from 'recompose';
import {
  LEADERBOARD,
  // XVSY,
  // STATEMENTS,
  // FREQUENCY,
  // COUNTER,
  // PIE,
  TEMPLATE_ACTIVITY_OVER_TIME,
  TEMPLATE_LAST_7_DAYS_STATEMENTS,
  TEMPLATE_MOST_ACTIVE_PEOPLE,
  TEMPLATE_MOST_POPULAR_ACTIVITIES,
  TEMPLATE_MOST_POPULAR_VERBS,
  TEMPLATE_WEEKDAYS_ACTIVITY,
  TEMPLATE_CURATR_INTERACTIONS_VS_ENGAGEMENT,
} from 'lib/constants/visualise';
import { withModel } from 'ui/utils/hocs';
import VisualiseResults from 'ui/containers/VisualiseResults';
import SourceResults from 'ui/containers/VisualiseResults/SourceResults';
import CustomBarChartViewer from './CustomBarChart/Viewer';
import TemplateActivityOverTime from './TemplateActivityOverTime/Viewer';
import TemplateLast7DaysStatements from './TemplateLast7DaysStatements/Viewer';
import TemplateMostActivePeople from './TemplateMostActivePeople/Viewer';
import TemplateMostPopularActivities from './TemplateMostPopularActivities/Viewer';
import TemplateMostPopularVerbs from './TemplateMostPopularVerbs/Viewer';
import TemplateWeekdaysActivity from './TemplateWeekdaysActivity/Viewer';
import TemplateCuratrInteractionsVsEngagement from './TemplateCuratrInteractionsVsEngagement/Viewer';

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
    default:
      if (showSourceView) {
        return <SourceResults id={visualisationId} />;
      }
      return <VisualiseResults id={visualisationId} />;
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
