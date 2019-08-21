import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.showStatsAtTop
 * @param {(showStatsAtTop: boolean) => void} props.onChange
 */
const ShowStatsAtTopSwitch = ({
  showStatsAtTop,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Show totals at top"
      checked={showStatsAtTop}
      onChange={onChange} />
  </div>
);

ShowStatsAtTopSwitch.propTypes = {
  showStatsAtTop: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(ShowStatsAtTopSwitch);
