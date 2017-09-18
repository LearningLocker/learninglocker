import { Map, OrderedMap } from 'immutable';
import {
  XVSY,
  STATEMENTS,
  POPULARACTIVITIES,
  LEADERBOARD,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'ui/utils/constants';

const createOptionModel = (searchString, optionKey) => new Map({ optionKey, searchString });

const createOptionModels = options => (new OrderedMap(options)).map(createOptionModel);

export const UNIQUENESS_OPS = [
  'uniqueCount', 'uniqueAverage', 'uniqueMax', 'uniqueMin'
];


const LINE_OPERATOR_OPTS = new OrderedMap({
  uniqueCount: 'Total unique number of...',
  count: 'Sum of...',
  average: 'Average of...',
  max: 'Max from...',
  min: 'Min from...',
});

const OPERATOR_OPTS = LINE_OPERATOR_OPTS.concat(new OrderedMap({
  uniqueAverage: 'Average unique number of...',
  uniqueMax: 'Max unique number of...',
  uniqueMin: 'Min unique number of...',
}));

export const VALUE_OPTS = createOptionModels({
  scaled: 'Scaled results',
  raw: 'Raw results',
  steps: 'Steps',
});

export const UNIQUENESS_VALUE_OPTS = createOptionModels({
  statements: 'Statements',
  people: 'People',
  activities: 'Activities',
  verb: 'Verbs',
  type: 'Activity types',
}).concat(VALUE_OPTS);

export const GROUP_OPTS = createOptionModels({
  date: 'Date',
  hour: 'Hour',
  weekday: 'Day',
  month: 'Month',
  year: 'Year',
  people: 'Person',
  activities: 'Activity',
  verb: 'Verb',
  type: 'Activity Type',
  raw: 'Raw Result',
});

export const getTypeOpts = (type) => {
  switch (type) {
    case FREQUENCY:
      return LINE_OPERATOR_OPTS;
    case XVSY:
    case STATEMENTS:
    case POPULARACTIVITIES:
    case LEADERBOARD:
    case COUNTER:
    case PIE:
      return OPERATOR_OPTS;
    default:
      return new OrderedMap();
  }
};
