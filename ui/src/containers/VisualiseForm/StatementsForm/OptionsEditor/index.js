import React from 'react';
import { XVSY, COUNTER, STATEMENTS, PIE, FREQUENCY } from 'ui/utils/constants';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';
import CounterEditor from './CounterEditor';
import DefaultEditor from './DefaultEditor';
import XvsYOptionsEditor from './XvsYOptionsEditor';

// [Viz Refactor] TODO: Remove This component
const OptionsEditor = ({ model, orgTimezone, updateModel }) => {
  const timezoneSelectorId = `Vis_${model._id}_TimezoneSelector`;
  return (
    <div>
      {(model.get('type') === XVSY) && <XvsYOptionsEditor model={model} />}
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
