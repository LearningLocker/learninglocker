import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'ui/components/Material/Switch';

/**
 * @param {boolean} props.isDonut
 * @param {(isDonut: boolean) => void} props.onChange
 */
const IsDonutSwitch = ({
  isDonut,
  onChange,
}) => (
  <div className="form-group">
    <Switch
      label="Donut chart"
      checked={isDonut}
      onChange={onChange} />
  </div>
);

IsDonutSwitch.propTypes = {
  isDonut: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(IsDonutSwitch);
