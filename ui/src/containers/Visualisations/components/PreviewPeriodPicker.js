import React from 'react';
import PropTypes from 'prop-types';
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
 * @param {string} props.visualisationId
 * @param {string} props.previewPeriod
 * @param {(previewPeriod: string) => void} props.onChange
 */
const PreviewPeriodPicker = ({
  visualisationId,
  previewPeriod,
  onChange,
}) => {
  const formId = `visualisation-previewPeriod-${visualisationId}`;
  return (
    <select
      id={formId}
      className="form-control"
      value={previewPeriod}
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
};

PreviewPeriodPicker.propTypes = {
  visualisationId: PropTypes.string.isRequired,
  previewPeriod: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default React.memo(PreviewPeriodPicker);
