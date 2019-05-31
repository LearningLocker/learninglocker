const map = {
  scaled: '$statement.result.score.scaled',
  raw: '$statement.result.score.raw',
  response: '$statement.result.response',
  steps: '$statement.object.definition.extensions.http://lrs&46;learninglocker&46;net/define/extensions/steps',
  people: '$person._id',
  activities: '$statement.object.id',
  verb: '$statement.verb.id',
  type: '$statement.object.definition.type',
  statements: '$_id',
};

/**
 * Build "value" expression used in projection stage
 *
 * @param {string} valueType
 * @returns string
 */
export default valueType => map[valueType] || `$${valueType}`;
