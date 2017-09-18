import formatDate from 'ui/utils/visualisations/helpers/formatDate';
import { map as periodMap } from 'ui/utils/visualisations/projections/period';

const map = {
  people: '$statement.actor',
  activities: {
    id: '$statement.object.id',
    definition: {
      name: '$statement.object.definition.name'
    }
  },
  verb: '$statement.verb',
  raw: '$statement.result.score.raw',
  type: '$statement.object.definition.type',
  year: { $year: '$timestamp' },
  date: formatDate('%Y-%m-%d'),
  ...periodMap,
};

export default group => map[group] || `$${group}`;
