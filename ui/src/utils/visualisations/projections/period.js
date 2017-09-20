export const map = {
  minute: { $minute: '$timestamp' },
  hour: { $hour: '$timestamp' },
  weekday: { $dayOfWeek: '$timestamp' },
  month: { $month: '$timestamp' },
};

export default group => map[group] || 'PROBLEM IN PERIOD PROJECTION';
