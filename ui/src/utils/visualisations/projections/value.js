const map = {
  scaled: '$statement.result.score.scaled',
  raw: '$statement.result.score.raw',
  steps: '$statement.object.definition.extensions.http://lrs&46;learninglocker&46;net/define/extensions/steps',
  people: '$person._id',
  activities: '$statement.object.id',
  verb: '$statement.verb.id',
  type: '$statement.object.definition.type',
  statements: '$_id',
};

export default value => map[value] || `$${value}`;
