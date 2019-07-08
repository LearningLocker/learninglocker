import React from 'react';
import PropTypes from 'prop-types';
import { FIVE, TEN, FIFTEEN, TWENTY } from 'ui/utils/constants';

/**
 * @param {FIVE|TEN|FIFTEEN|TWENTY} props.barChartGroupingLimit
 * @param {(limit: FIVE|TEN|FIFTEEN|TWENTY) => void} props.onChange
 */
const BarChartGroupingLimit = ({
  barChartGroupingLimit,
  onChange,
}) => (
  <div className="form-group">
    <select
      className="options-menu"
      value={barChartGroupingLimit}
      onChange={e => onChange(parseInt(e.target.value))}>

      <option value={FIVE}>Show 5</option>
      <option value={TEN}>Show 10</option>
      <option value={FIFTEEN}>Show 15</option>
      <option value={TWENTY}>Show 20</option>
    </select>
  </div>
);

BarChartGroupingLimit.propTypes = {
  barChartGroupingLimit: PropTypes.oneOf([FIVE, TEN, FIFTEEN, TWENTY]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(BarChartGroupingLimit);
