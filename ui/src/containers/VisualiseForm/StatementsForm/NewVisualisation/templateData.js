import { fromJS, Map } from 'immutable';
import {
  LEADERBOARD,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  LAST_30_DAYS,
} from 'ui/utils/constants';

/**
 * @type {immutable.Map}
 *
 * {
 *   title: string
 *   id: string
 *   type: LEADERBOARD|STATEMENTS|FREQUENCY|COUNTER|XVSY|PIE
 *   onCreate?: (updateModel: ({
 *     path: string[],
*      value: any,
 *   }) => void) => void
 * }
 */
const templateData = fromJS({
  1: {
    title: 'How many statements have been stored in the last 7 days?',
    id: '1',
    type: COUNTER,
  },
  2: {
    title: 'How has activity changed over time?',
    id: '2',
    type: FREQUENCY,
    onCreate: (updateModel) => {
      updateModel({ path: ['previewPeriod'], value: LAST_30_DAYS });
    },
  },
  3: {
    title: 'What are the most popular verbs?',
    id: '3',
    type: LEADERBOARD,
    onCreate: (updateModel) => {
      updateModel({ path: ['previewPeriod'], value: LAST_30_DAYS });
      updateModel({
        path: ['axesgroup'],
        value: new Map({ optionKey: 'verb', searchString: 'Verb' }),
      });
    },
  },
  4: {
    title: 'What are the most popular activities?',
    id: '4',
    type: LEADERBOARD,
    onCreate: (updateModel) => {
      updateModel({ path: ['previewPeriod'], value: LAST_30_DAYS });
      updateModel({
        path: ['axesgroup'],
        value: new Map({ optionKey: 'activity', searchString: 'Activity' }),
      });
    },
  },
  5: {
    title: 'Who are the most active people?',
    id: '5',
    type: LEADERBOARD,
    onCreate: (updateModel) => {
      updateModel({ path: ['previewPeriod'], value: LAST_30_DAYS });
      updateModel({
        path: ['axesgroup'],
        value: new Map({ optionKey: 'people', searchString: 'Person' }),
      });
    },
  },
  6: {
    title: 'How does activity change in a week?',
    id: '6',
    type: STATEMENTS,
    onCreate: (updateModel) => {
      updateModel({
        path: ['axesgroup'],
        value: new Map({ optionKey: 'weekday', searchString: 'Day' }),
      });
    },
  },
});

export default templateData;
