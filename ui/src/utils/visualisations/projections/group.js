import formatDate from 'ui/utils/visualisations/helpers/formatDate';
import { map as periodMap } from 'ui/utils/visualisations/projections/period';

const map = {
  people: '$person._id',
  activities: '$statement.object.id',
  verb: '$statement.verb.id',
  type: '$statement.object.definition.type',
  raw: '$statement.result.score.raw',
  year: { $year: '$timestamp' },
  date: formatDate('%Y-%m-%d'),
  ...periodMap,
};

export default group => map[group] || `$${group}`;
