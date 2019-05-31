import { fromJS } from 'immutable';
import {
  LEADERBOARD,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
} from 'ui/utils/constants';

/**
 * @type {immutable.Map}
 *
 * {
 *   title: string,
 *   id: string,
 *   type: LEADERBOARD|STATEMENTS|FREQUENCY|COUNTER|XVSY|PIE,
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
  },
  3: {
    title: 'What are the most popular verbs?',
    id: '3',
    type: LEADERBOARD,
  },
  4: {
    title: 'What are the most popular activities?',
    id: '4',
    type: LEADERBOARD,
  },
  5: {
    title: 'Who are the most active people?',
    id: '5',
    type: LEADERBOARD,
  },
  6: {
    title: 'How does activity change in a week?',
    id: '6',
    type: STATEMENTS,
  },
});

export default templateData;
