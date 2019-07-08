import React from 'react';
import PropTypes from 'prop-types';
import { TimezoneSelector, buildDefaultOptionLabel } from 'ui/components/TimezoneSelector';

/**
 * @param {string} props.visualisationId
 * @param {string|null} props.timezone - visualisation timezone
 * @param {string} props.orgTimezone
 * @param {(timezone: string|null) => void} props.onChange
 */
const TimezoneForm = ({
  visualisationId,
  timezone,
  orgTimezone,
  onChange,
}) => {
  const formId = `visualisation-timezone-${visualisationId}`;
  return (
    <div className="form-group">
      <label htmlFor={formId}>
        Timezone
      </label>

      <TimezoneSelector
        id={formId}
        value={timezone}
        onChange={onChange}
        defaultOption={{
          label: buildDefaultOptionLabel(orgTimezone),
          value: orgTimezone,
        }} />
    </div>
  );
};

TimezoneForm.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  timezone: PropTypes.string,
  orgTimezone: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(TimezoneForm);
