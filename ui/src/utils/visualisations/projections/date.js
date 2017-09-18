import formatDate from 'ui/utils/visualisations/helpers/formatDate';

const map = {
  minute: formatDate('%Y-%m-%dT%H-%M'),
  hour: formatDate('%Y-%m-%dT%H'),
  weekday: formatDate('%Y-%m-%d'),
  month: formatDate('%Y-%m'),
};

export default group => map[group] || 'PROBLEM IN DATE PROJECTION';
