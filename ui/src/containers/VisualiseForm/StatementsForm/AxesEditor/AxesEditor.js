import React from 'react';
import {
  XVSY,
  STATEMENTS,
  POPULARACTIVITIES,
  LEADERBOARD,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'ui/utils/constants';
import BarAxesEditor from './BarAxesEditor';
import ColumnAxesEditor from './ColumnAxesEditor';
import LineAxesEditor from './LineAxesEditor';
import ScatterAxesEditor from './ScatterAxesEditor';
import CounterAxesEditor from './CounterAxesEditor';
import PieAxesEditor from './PieAxesEditor';

export default ({ model }) => {
  switch (model.get('type')) {
    case LEADERBOARD:
    case POPULARACTIVITIES:
      return <BarAxesEditor model={model} />;
    case XVSY: return <ScatterAxesEditor model={model} />;
    case STATEMENTS: return <ColumnAxesEditor model={model} />;
    case FREQUENCY: return <LineAxesEditor model={model} />;
    case COUNTER: return <CounterAxesEditor model={model} />;
    case PIE: return <PieAxesEditor model={model} />;
    default: return <div>renderDefault</div>;
  }
};
