import period from 'ui/utils/visualisations/projections/period';

const map = {
  people: '$person._id',
  activities: '$statement.object.id',
  verb: '$statement.verb.id',
  type: '$statement.object.definition.type',
  raw: '$statement.result.score.raw',
  response: '$statement.result.response',
};

/**
 * Build "group" expression used in projection stage
 *
 * @param {string} groupType
 * @param {string} timezone
 * @returns object|string
 */
export default (groupType, timezone) =>
  map[groupType] || period(groupType, timezone) || `$${groupType}`;
