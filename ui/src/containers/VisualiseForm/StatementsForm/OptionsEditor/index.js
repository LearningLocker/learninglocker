import React from 'react';
import { XVSY, LEADERBOARD, COUNTER, STATEMENTS, PIE, FREQUENCY } from 'ui/utils/constants';
import BarEditor from './BarEditor';
import CounterEditor from './CounterEditor';
import DefaultEditor from './DefaultEditor';
import XvsYOptionsEditor from './XvsYOptionsEditor';

const OptionsEditor = ({ model }) => (
  <div>
    {(model.get('type') === XVSY) && <XvsYOptionsEditor model={model} />}
    {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
    {(model.get('type') === COUNTER) && <CounterEditor model={model} />}
    {(model.get('type') === STATEMENTS) && <DefaultEditor model={model} />}
    {(model.get('type') === PIE) && <DefaultEditor model={model} />}
    {(model.get('type') === FREQUENCY) && <DefaultEditor model={model} />}
  </div>
);

export default OptionsEditor;
