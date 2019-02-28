import React from 'react';
import moment from 'moment-timezone';

const NULL = 'null';

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
 *   showNullOption: PropTypes.boolean,
 * }
 */
const TimezoneSelector = ({ id, value, onChange, showNullOption }) => (
  <select
    id={id || 'timezone-selector'}
    className="form-control"
    value={value === null ? NULL : value}
    onChange={(e) => {
      console.log(e.target.value);
      const tz = e.target.value === NULL ? null : e.target.value;
      onChange(tz);
    }} >
    {showNullOption && (
      <option value={NULL}>Organisation Timezone</option>
    )}
    {options}
  </select>
);

export default TimezoneSelector;
