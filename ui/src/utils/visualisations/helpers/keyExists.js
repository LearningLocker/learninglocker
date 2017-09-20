const checkKeyExists = key => ({
  [(key)]: { $exists: true }
});

const map = {
  scaled: checkKeyExists('statement.result.score.scaled'),
  raw: checkKeyExists('statement.result.score.raw'),
  steps: checkKeyExists('statement.object.definition.extensions.http://lrs&46;learninglocker&46;net/define/extensions'),
  people: checkKeyExists('person._id'),
  type: checkKeyExists('statement.object.definition.type'),
  activities: {},
  verb: {},
  statements: {},
  minute: {},
  hour: {},
  weekday: {},
  month: {},
  year: {},
  date: {},
};

export default value => map[value] || checkKeyExists(value);
