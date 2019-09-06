import React from 'react';
import {
  XVSY,
  STATEMENTS,
  FREQUENCY,
  COUNTER,
  PIE,
} from 'lib/constants/visualise';
import ColumnAxesEditor from './ColumnAxesEditor';
import LineAxesEditor from './LineAxesEditor';
import ScatterAxesEditor from './ScatterAxesEditor';
import CounterAxesEditor from './CounterAxesEditor';
import PieAxesEditor from './PieAxesEditor';

// [Viz Refactor] TODO: Remove This component and put each OooooAxesEditor directly into Visualisation/.../Editor
const AxesEditor = ({ model, orgTimezone }) => {
  switch (model.get('type')) {
    case XVSY: return <ScatterAxesEditor model={model} orgTimezone={orgTimezone} />;
    case STATEMENTS: return <ColumnAxesEditor model={model} />;
    case FREQUENCY: return <LineAxesEditor model={model} />;
    case COUNTER: return <CounterAxesEditor model={model} />;
    case PIE: return <PieAxesEditor model={model} />;
    default: return <div>renderDefault</div>;
  }
};

export default AxesEditor;
