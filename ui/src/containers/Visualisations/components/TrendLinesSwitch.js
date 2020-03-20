import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

 /**
 * @param {boolean} props.showTrendLines
 * @param {(trendLines: boolean) => void} props.onChange
 */
const TrendLinesSwitch = ({
  showTrendLines,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Trend Lines"
      checked={showTrendLines}
      onChange={onChange} />
  </div>
);

TrendLinesSwitch.propTypes = {
  showTrendLines: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(TrendLinesSwitch);
