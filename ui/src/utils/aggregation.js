const actors = [
  { $match: {
    'statement.actor.objectType': 'Agent'
  } },
  { $group: {
    _id: '$statement.actor',
    result: { $first: '$statement.actor' }
  } }
];

const verbs = [
  { $group: {
    _id: '$statement.verb.id',
    result: { $first: '$statement.verb' }
  } }
];

const activities = [
  { $match: {
    'statement.object.objectType': 'Activity'
  } },
  { $group: {
    _id: '$statement.object.id',
    result: { $first: '$statement.object' }
  } }
];

const objects = [
  { $match: {
    'statement.object.objectType': { $ne: 'Activity' }
  } },
  { $group: {
    _id: '$statement.object.id',
    result: { $first: '$statement.object' }
  } }
];

const objectTypes = [
  { $group: {
    _id: '$statement.object.objectType',
    result: { $first: '$statement.object.objectType' }
  } }
];

const objectDefinitionTypes = [
  { $group: {
    _id: '$statement.object.definition.type',
    result: { $first: '$statement.object.definition.type' }
  } }
];

const contextParents = [
  { $match: { 'statement.context.contextActivities.parent.objectType': 'Activity' } },
  { $project: { _id: 0, 'statement.context.contextActivities.parent': 1 } },
  { $unwind: '$statement.context.contextActivities.parent' },
  { $match: { 'statement.context.contextActivities.parent.objectType': 'Activity' } },
  { $group: {
    _id: '$statement.context.contextActivities.parent.id',
    result: { $first: '$statement.context.contextActivities.parent' }
  } }
];

const contextGroupings = [
  { $match: { 'statement.context.contextActivities.grouping.objectType': 'Activity' } },
  { $project: { _id: 0, 'statement.context.contextActivities.grouping': 1 } },
  { $unwind: '$statement.context.contextActivities.grouping' },
  { $match: { 'statement.context.contextActivities.grouping.objectType': 'Activity' } },
  { $group: {
    _id: '$statement.context.contextActivities.grouping.id',
    result: { $first: '$statement.context.contextActivities.grouping' }
  } }
];

const contextPlatforms = [
  { $match: { 'statement.context.platform': { $exists: true } } },
  { $project: { _id: 0, 'statement.context.platform': 1 } },
  { $group: {
    _id: '$statement.context.platform',
    result: { $first: '$statement.context.platform' }
  } },
  { $sort: { _id: 1 } }
];

const contextInstructors = [
  { $match: { 'statement.context.instructor.objectType': 'Agent' } }, // assume for now that we don't want to look for groups
  { $group: {
    _id: 'statement.context.instructor',
    result: { $first: '$statement.context.instructor' }
  } }
];

const contextLanguages = [
  { $match: { 'statement.context.language': { $exists: true } } },
  { $project: { _id: 0, 'statement.context.language': 1 } },
  { $group: {
    _id: '$statement.context.language',
    result: { $first: '$statement.context.language' }
  } },
  { $sort: { _id: 1 } }
];


export {
  actors,
  verbs,
  activities,
  objects,
  objectTypes,
  objectDefinitionTypes,
  contextParents,
  contextGroupings,
  contextPlatforms,
  contextInstructors,
  contextLanguages,
};
