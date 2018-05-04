// @ts-check
import React from 'react';
// @ts-ignore
import { LEADERBOARD, XVSY, FREQUENCY, COUNTER, PIE, STATEMENTS, COLUMN } from 'ui/utils/constants';
import Counter from './Counter';
import ValuesPie from './ValuesPie';
import ValuesHorizontalBar from './ValuesHorizontalBar';
import ValuesLine from './ValuesLine';
import ValuesVerticalBar from './ValuesVerticalBar';
import ValuesTable from './ValuesTable';
import TuplesScatter from './TuplesScatter';
import TuplesTable from './TuplesTable';

export default ({ model }) => {
  switch (model.get('type')) {
    case COUNTER: {
      return <Counter model={model} />;
    }
    case PIE: {
      return <ValuesPie model={model} />;
    }
    case LEADERBOARD: {
      return <ValuesHorizontalBar model={model} />;
    }
    case STATEMENTS: {
      return <ValuesVerticalBar model={model} />;
    }
    case FREQUENCY: {
      return <ValuesLine model={model} />;
    }
    case 'valuesTable': {
      return <ValuesTable model={model} />;
    }
    case XVSY: {
      return <TuplesScatter model={model} />;
    }
    case 'tuplesTable': {
      return <TuplesTable model={model} />;
    }
    default: {
      return <span>Unknown Type {model.type}</span>;
    }
  }
};
