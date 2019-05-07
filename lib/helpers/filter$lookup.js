import {
  isPlainObject,
  reject,
  isArray,
  get,
  set,
  includes,
  has,
  map,
  omitBy,
  mapValues
} from 'lodash';

const ALLOWED_LOOKUPS = [
  'personas',
  'personaIdentifiers',
  'personaAttributes',
  'journeys',
  'journeyprogresses',
  'statements',
];

const shouldRemove = pipeline => (
    has(pipeline, ['$lookup', 'from']) &&
    !includes(ALLOWED_LOOKUPS, get(pipeline, ['$lookup', 'from']))
  );

const filterPipeline = (stage, organisation) => {
  if(!has(stage, '$lookup')) {
    return stage;
  }

  const org$matchStage = [
    {
      $match: { organisation }
    }
  ];
  const existingPipeline = get(stage, ['$lookup', 'pipeline'], []);

  const newPipeline = [
    ...org$matchStage,
    ...existingPipeline,
  ];
  
  const newStage = set(stage, ['$lookup', 'pipeline'], newPipeline);
  return newStage;
};

const filter$lookup = (pipeline, organisation) => {
  let filteredPipeline = pipeline;

  if (isArray(filteredPipeline)) {
    filteredPipeline = reject(filteredPipeline, shouldRemove);

    return map(filteredPipeline, stage => filter$lookup(stage, organisation));
  }

  if (isPlainObject(filteredPipeline)) {
    // remove $lookup stages without allowed collections
    filteredPipeline = omitBy(filteredPipeline, shouldRemove);

    // add organisation $match to pipeline of lookup
    filteredPipeline = filterPipeline(filteredPipeline, organisation);
    return mapValues(filteredPipeline, stage => filter$lookup(stage, organisation));
  }

  return pipeline;
};

export default filter$lookup;
