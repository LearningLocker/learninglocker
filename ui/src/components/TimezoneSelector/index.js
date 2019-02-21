import React from 'react';
import moment from 'moment-timezone';

const options = moment.tz.names().map(v => (
  <option key={v} value={v}>{`${v} (${moment().tz(v).format('Z')})`}</option>
));

/**
 * Timezone Selector
 *
 * @props {object} props - {
 *   id: PropTypes.string,
 *   value: PropTypes.string.isRequired,
 *   onChange: PropTypes.func.isRequired,
 * }
 */
const TimezoneSelector = ({ id, value, onChange }) => (
  <select
    id={id || 'timezone-selector'}
    className="form-control"
    value={value}
    onChange={e => onChange(e.target.value)} >
    {options}
  </select>
);

export default TimezoneSelector;
