import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.showStats
 * @param {(showStats: boolean) => void} props.onChange
 */
const ShowStatsSwitch = ({
  showStats,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Show totals"
      checked={showStats}
      onChange={onChange} />
  </div>
);

ShowStatsSwitch.propTypes = {
  showStats: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(ShowStatsSwitch);
