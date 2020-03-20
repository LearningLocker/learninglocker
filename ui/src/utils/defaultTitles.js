import React from 'react';
import { startCase, toLower } from 'lodash';
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
import VisualiseIcon from 'ui/components/VisualiseIcon';
import { OPERATOR_OPTS } from 'ui/utils/visualisations/localOptions';
import chevronUpIcon from './assets/ll-chevron-up-icon.svg';
import chevronDownIcon from './assets/ll-chevron-down-icon.svg';


const axv = 'axesvalue';
const axV = 'axesxValue';
const ayV = 'axesyValue';
const axg = 'axesgroup';

export const shorten = (target, forXAxis) => {
  if (target.length >= 20 && forXAxis) {
    if (target.indexOf(' ') !== -1) {
      return target.split(' ')[0];
    }
    if (target.indexOf('.') !== -1) {
      return target.split('.')[0];
    }
    if (target.indexOf('%20') !== -1) {
      return target.split('%20')[target.split('%20').length];
    }
    return target.substring(0, 24);
  } else if (target.length >= 20) {
    return target.substring(0, 46);
  }
  return target;
};

const makeOperatorReadable = (model, operatorName) => {
  const operator = model.get(operatorName);
  if (operator === 'uniqueCount') {
    return '';
  }
  return `${OPERATOR_OPTS.get(operator)} `;
};

/**
* @param {immutable.Map} model - visualisation model
* @return {string}
  */
export const createDefaultTitle = (model) => {
  const type = model.get('type', null);

  if (type === null) {
    return 'Pick a visualisation';
  }

  const select = key => model.getIn([key, 'searchString'], '');
  const addXY = (selectedX, selectedY) => `X: ${startCase(toLower(selectedX))} Y: ${makeOperatorReadable(model, 'axesoperator')}${startCase(toLower(selectedY))}`;
  const addXVSYXY = (selectedX, selectedY) => `X: ${makeOperatorReadable(model, 'axesxOperator')} ${startCase(toLower(selectedX))} Y: ${makeOperatorReadable(model, 'axesyOperator')}${startCase(toLower(selectedY))}`;
  const addYX = (selectedX, selectedY) => `X: ${startCase(toLower(selectedY))} Y: ${makeOperatorReadable(model, 'axesoperator')}${startCase(toLower(selectedX))}`;

  switch (type) {
    case FREQUENCY:
    case TEMPLATE_ACTIVITY_OVER_TIME:
      return addYX(select(axv) || select(ayV), 'Time');
    case LEADERBOARD:
    case TEMPLATE_MOST_ACTIVE_PEOPLE:
    case TEMPLATE_MOST_POPULAR_ACTIVITIES:
    case TEMPLATE_MOST_POPULAR_VERBS:
    case TEMPLATE_LEARNING_EXPERIENCE_TYPE:
    case TEMPLATE_STREAM_USER_ENGAGEMENT_LEADERBOARD:
    case TEMPLATE_STREAM_ACTIVITIES_WITH_MOST_COMMENTS:
      return addYX(select(axg), select(axv) || select(ayV) || 'Time');
    case XVSY:
    case TEMPLATE_STREAM_INTERACTIONS_VS_ENGAGEMENT:
      return addXVSYXY(select(axV), select(axv) || select(ayV) || 'Time');
    case COUNTER:
    case TEMPLATE_LAST_7_DAYS_STATEMENTS:
    case TEMPLATE_STREAM_COMMENT_COUNT:
      return `${makeOperatorReadable(model, 'axesoperator')}${select(axv) || select(ayV)}`;
    case PIE:
    case TEMPLATE_STREAM_PROPORTION_OF_SOCIAL_INTERACTIONS:
      return `${makeOperatorReadable(model, 'axesoperator')}${select(axv) || select(ayV)} / ${select(axg)}`;
    case STATEMENTS:
    case TEMPLATE_WEEKDAYS_ACTIVITY:
    case TEMPLATE_STREAM_LEARNER_INTERACTIONS_BY_DATE_AND_VERB:
      return addXY(select(axg), select(axv) || select(ayV) || 'Time');
    default:
      return 'Empty';
  }
};

export const createDefaultTitleWithIcon = model => (
  <span>
    <VisualiseIcon
      type={model.get('type')}
      sourceView={model.get('sourceView', false)} />

    <span style={{ marginLeft: '3px' }}>
      {
        model.get('description') ||
        (
          <span style={{ color: '#B9B9B9', fontWeight: '100' }}>
            {createDefaultTitle(model)}
          </span>
        )
      }
    </span>
  </span>
);

export const getPercentage = (res1, res2) => {
  const newValue = res1 || 0;
  const oldValue = res2 || 0;
  const percentage = parseInt(Math.round(((newValue - oldValue) / newValue) * 100));
  if (res2 === 0 || isNaN(percentage)) {
    return { result: 'N/A', color: '#9BA5AB' };
  }

  if (percentage < 0) {
    return { result: `${percentage.toString().replace(/^-/, '')}%`, icon: chevronDownIcon, marginBottom: '0' };
  }

  return { result: `${percentage}%`, icon: chevronUpIcon, marginBottom: '6%' };
};

export const wrapLabel = (target) => {
  const separatedStrings = [];
  const index = 46;
  let remainingSection = target;
  let sectionIndex;
  let firstSection;
  while (remainingSection.length > index) {
    sectionIndex = remainingSection.lastIndexOf(' ', index);
    if (sectionIndex < 1) {
      sectionIndex = remainingSection.lastIndexOf('.', index);
    }
    if (sectionIndex < 1) {
      sectionIndex = remainingSection.lastIndexOf('%20', index);
    }
    if (sectionIndex < 1) {
      sectionIndex = index;
    }
    firstSection = remainingSection.substring(0, sectionIndex);
    remainingSection = remainingSection.substring(sectionIndex);
    separatedStrings.push(firstSection);
  }
  separatedStrings.push(remainingSection);
  return separatedStrings.join('\n');
};
