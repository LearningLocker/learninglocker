import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {string} props.visualisationId
 * @param {boolean} props.stacked
 * @param {(stacked: boolean) => void} props.onChange
 */
const StackedSwitch = ({
  visualisationId,
  stacked,
  onChange,
}) => {
  const formId = `visualisation-stacked-${visualisationId}`;
  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Stacked/Grouped
      </label>

      <div id={formId}>
        <Switch
          checked={!stacked}
          onChange={checked => onChange(!checked)} />
      </div>
    </div>
  );
};

StackedSwitch.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  stacked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(StackedSwitch);
