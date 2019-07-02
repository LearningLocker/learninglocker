import React from 'react';

import {
  TODAY,
  LAST_24_HOURS,
  LAST_7_DAYS,
  LAST_30_DAYS,
  LAST_2_MONTHS,
  LAST_6_MONTHS,
  LAST_1_YEAR,
  LAST_2_YEARS,
} from 'ui/utils/constants';

/**
 * @params {{
 *   visualisation: immutable.Map,
 *   onChange: (previewPeriod: string) => null,
 * }}
 */
const PreviewPeriodPicker = ({
  visualisation,
  onChange,
}) => (
  <select
    id={`${visualisation.get('_id')}previewPeriodInput`}
    className="form-control"
    value={visualisation.get('previewPeriod')}
    onChange={e => onChange(e.target.value)}>
    <option value={TODAY}>Today</option>
    <option value={LAST_24_HOURS}>Last 24 hours</option>
    <option value={LAST_7_DAYS}>Last 7 days</option>
    <option value={LAST_30_DAYS}>Last 30 days</option>
    <option value={LAST_2_MONTHS}>Last 2 months</option>
    <option value={LAST_6_MONTHS}>Last 6 months</option>
    <option value={LAST_1_YEAR}>Last 1 year</option>
    <option value={LAST_2_YEARS}>Last 2 years</option>
  </select>
);

export default PreviewPeriodPicker;
