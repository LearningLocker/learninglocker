import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.showStatsAtTop
 * @param {(showStatsAtBottom: boolean) => void} props.onChange
 */
const ShowStatsAtBottomSwitch = ({
  showStatsAtBottom,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Show totals at bottom"
      checked={showStatsAtBottom}
      onChange={onChange} />
  </div>
);

ShowStatsAtBottomSwitch.propTypes = {
  showStatsAtBottom: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(ShowStatsAtBottomSwitch);
