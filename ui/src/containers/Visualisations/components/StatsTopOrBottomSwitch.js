import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.showStats
 * @param {(statsAtBottom: boolean) => void} props.onChange
 */
const StatsTopOrBottomSwitch = ({
  statsAtBottom,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Top / Bottom"
      checked={statsAtBottom}
      onChange={onChange} />
  </div>
);

StatsTopOrBottomSwitch.propTypes = {
  statsAtBottom: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(StatsTopOrBottomSwitch);
