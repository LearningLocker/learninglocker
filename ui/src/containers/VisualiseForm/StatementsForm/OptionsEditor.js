import React from 'react';
import { XVSY, LEADERBOARD, COUNTER, STATEMENTS, PIE, FREQUENCY, STATEMENT } from 'ui/utils/constants';
import XvsYOptionsEditor from './OptionsEditor/XvsYOptionsEditor';
import BarEditor from './OptionsEditor/BarEditor';
import CounterEditor from './OptionsEditor/CounterEditor';
import DefaultEditor from './OptionsEditor/DefaultEditor';
import StatementEditor from './OptionsEditor/StatementEditor';


const OptionsEditor = ({ model }) => (
  <div>
    {model.get('type') === XVSY && <XvsYOptionsEditor model={model} />}
    {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
    {(model.get('type') === COUNTER) && <CounterEditor model={model} />}
    {(model.get('type') === STATEMENTS) && <DefaultEditor model={model} />}
    {(model.get('type') === STATEMENT) && <StatementEditor model={model} />}
    {(model.get('type') === PIE) && <DefaultEditor model={model} />}
    {(model.get('type') === FREQUENCY) && <DefaultEditor model={model} />}
  </div>
);

export default OptionsEditor;
