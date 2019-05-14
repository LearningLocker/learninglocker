import {
  isPlainObject,
  reject,
  isArray,
  get,
  set,
  includes,
  has,
  map
} from 'lodash';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

const ALLOWED_COLLECTIONS = [
  'personas',
  'personaIdentifiers',
  'personaAttributes',
  'journeys',
  'journeyprogresses',
  'statements',
];

const COLLECTIONS_TO_MODELS = {
  personas: 'persona',
  personaIdentifiers: 'personaidentifier',
  personaAttributes: 'personaattribute',
  journeys: 'journey',
  journeyprogresses: 'journeyprogress',
  statements: 'statement',
};

const shouldRemove = pipeline => (
    has(pipeline, ['$lookup', 'from']) &&
    !includes(ALLOWED_COLLECTIONS, get(pipeline, ['$lookup', 'from']))
  );

const filterPipeline = async (stage, authInfo) => {
  if (!has(stage, '$lookup')) {
    return stage;
  }

  if (!authInfo) {
    return stage;
  }

  const collection = get(stage, ['$lookup', 'from']);
  const scopedFilter = await getScopeFilter({
    modelName: COLLECTIONS_TO_MODELS[collection],
    actionName: 'view',
    authInfo,
    allowDashboardAccess: true
  });

  const authInfoFilterStage = [
    { $match: scopedFilter }
  ];

  const existingPipeline = get(stage, ['$lookup', 'pipeline'], []);

  const newPipeline = [
    ...authInfoFilterStage,
    ...existingPipeline,
  ];

  const newStage = set(stage, ['$lookup', 'pipeline'], newPipeline);
  return newStage;
};

const filter$lookup = async (pipeline, authInfo) => {
  if (isArray(pipeline)) {
    const filteredPipeline = reject(pipeline, shouldRemove);

    return await Promise.all(map(filteredPipeline, stage => filter$lookup(stage, authInfo)));
  }

  if (isPlainObject(pipeline)) {
    // add filters to $match to pipeline of lookup
    const filteredPipeline = await filterPipeline(pipeline, authInfo);

    return await Object.keys(filteredPipeline).reduce(async (reduction, key) => {
      const stage = filteredPipeline[key];
      return {
        ...await reduction,
        [key]: await filter$lookup(stage, authInfo),
      };
    }, Promise.resolve({}));
  }

  return pipeline;
};

export default filter$lookup;
