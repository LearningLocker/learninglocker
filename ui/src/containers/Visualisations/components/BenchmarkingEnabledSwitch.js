import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {string} props.visualisationId
 * @param {boolean} props.benchmarkingEnabled
 * @param {(benchmarkingEnabled: boolean) => void} props.onChange
 */
const BenchmarkingEnabledSwitch = ({
  visualisationId,
  benchmarkingEnabled,
  onChange,
}) => {
  const formId = `visualisation-enable-benchmarking-${visualisationId}`;
  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Enable Benchmarking
      </label>

      <div id={formId}>
        <Switch
          checked={benchmarkingEnabled}
          onChange={onChange} />
      </div>
    </div>
  );
};

BenchmarkingEnabledSwitch.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  benchmarkingEnabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(BenchmarkingEnabledSwitch);
