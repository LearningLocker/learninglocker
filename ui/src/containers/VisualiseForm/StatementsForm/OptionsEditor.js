import React from 'react';
import { XVSY, LEADERBOARD, COUNTER, STATEMENTS, PIE, FREQUENCY } from 'ui/utils/constants';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';
import XvsYOptionsEditor from './OptionsEditor/XvsYOptionsEditor';
import BarEditor from './OptionsEditor/BarEditor';
import CounterEditor from './OptionsEditor/CounterEditor';
import DefaultEditor from './OptionsEditor/DefaultEditor';


const OptionsEditor = ({ model, orgTimezone, updateModel }) => {
  const timezoneSelectorId = `Vis_${model._id}_TimezoneSelector`;
  return (
    <div>
      {(model.get('type') === XVSY) && <XvsYOptionsEditor model={model} />}
      {(model.get('type') === LEADERBOARD) && <BarEditor model={model} />}
      {(model.get('type') === COUNTER) && <CounterEditor model={model} />}
      {(model.get('type') === STATEMENTS) && <DefaultEditor model={model} />}
      {(model.get('type') === PIE) && <DefaultEditor model={model} />}
      {(model.get('type') === FREQUENCY) && <DefaultEditor model={model} />}

      <label htmlFor={timezoneSelectorId}>Timezone</label>
      <TimezoneSelector
        id={timezoneSelectorId}
        value={model.get('timezone', null)}
        onChange={value => updateModel({
          schema: 'visualisation',
          id: model.get('_id'),
          path: 'timezone',
          value,
        })}
        defaultOption={{
          label: buildDefaultOptionLabel(orgTimezone),
          value: orgTimezone,
        }} />
    </div>
  );
};

export default OptionsEditor;
