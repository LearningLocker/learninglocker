import React from 'react';
import { timezones, timezoneLabels } from 'lib/constants/timezones';

const DEFAULT = 'DEFAULT_VALUE';

const options = timezones.map(tz => (
  <option key={tz[0]} value={tz[0]}>{tz[1]}</option>
));

export const buildDefaultOptionLabel = orgTimezone =>
  `Organisation Default: ${timezoneLabels.get(orgTimezone)}`;

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
 *   disabled: PropTypes.boolean,
 * }
 */
export const TimezoneSelector = ({ id, value, onChange, defaultOption, disabled }) => (
  <select
    id={id || 'timezone-selector'}
    className="form-control"
    value={value === null ? DEFAULT : value}
    disabled={disabled}
    onChange={(e) => {
      const tz = e.target.value === DEFAULT ? null : e.target.value;
      onChange(tz);
    }} >
    {defaultOption && (
      <option value={DEFAULT}>
        {defaultOption.label}
      </option>
    )}
    {options}
  </select>
);
