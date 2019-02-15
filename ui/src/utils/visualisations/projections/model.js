import period from 'ui/utils/visualisations/projections/period';

const map = {
  people: '$person.display',
  activities: {
    objectType: '$statement.object.objectType',
    id: '$statement.object.id',
    definition: {
      name: '$statement.object.definition.name'
    }
  },
  verb: '$statement.verb',
  raw: '$statement.result.score.raw',
  response: '$statement.result.response',
  type: '$statement.object.definition.type',
};

/**
 * Build "model" expression used in projection stage
 *
 * @param {string} groupType
 * @param {string} timezone
 * @returns object|string
 */
export default (groupType, timezone) =>
  map[groupType] || period(groupType, timezone) || `$${groupType}`;
