import React from 'react';
import moment from 'moment-timezone';

const DEFAULT = 'DEFAULT_VALUE';

const options = moment.tz.names().map(v => (
  <option key={v} value={v}>{`${v} (${moment().tz(v).format('Z')})`}</option>
));

export const buildDefaultOptionLabel = orgTimezone =>
  `Organisation Default: ${orgTimezone}`;

/**
 * Timezone Selector
 *
 * @props {object} props - {
 *   id: PropTypes.string,
 *   value: PropTypes.string.isRequired,
 *   onChange: PropTypes.func.isRequired,
 *   defaultOption: {
 *     label: PropTypes.string,
 *     value: PropTypes.any,
 *   },
 * }
 */
export const TimezoneSelector = ({ id, value, onChange, defaultOption }) => (
  <select
    id={id || 'timezone-selector'}
    className="form-control"
    value={value === null ? DEFAULT : value}
    onChange={(e) => {
      const tz = e.target.value === DEFAULT ? defaultOption.value : e.target.value;
      onChange(tz);
    }} >
    {defaultOption && (
      // Why not <option value={defaultOption.value}> ?
      // To pass null props.onChange.
      // When defaultOption.value is null, e.target.value becomes defaultOption.label in this.onChange,
      <option value={DEFAULT}>
        {defaultOption.label}
      </option>
    )}
    {options}
  </select>
);
